#!/usr/bin/env node
/**
 * Post-build check of the KO/EN machinery, run against the emitted `public/`
 * tree rather than against the source. Everything here is a claim the README
 * makes about this site; this file is where those claims are mechanical.
 *
 * It asserts, for every emitted page:
 *
 *   1. the page is self-canonical, with an absolute URL built from `baseUrl`;
 *   2. its hreflang set includes ITS OWN language and every counterpart, that
 *      each counterpart references it back, and that an x-default exists —
 *      omitting the self entry is the usual way hreflang silently does nothing;
 *   3. `<html lang>` agrees with the language tree the page sits in;
 *   4. the language switcher links to a file that actually exists, in the
 *      right language, whose own switcher links back here — and that where no
 *      counterpart exists it renders a disabled, non-anchor span instead. That
 *      is the common case: most posts are Korean-only;
 *   5. the *chrome* is in the page's own language — the search button, the
 *      explorer and table-of-contents headings, the theme and reader toggles,
 *      the graph and backlinks headings, the generated folder title, and the
 *      date format. Upstream Quartz has one global `locale`, so this is the
 *      claim most likely to quietly regress: a pull from upstream that adds a
 *      component, or a hand-edit that drops the per-page locale `renderPage`
 *      threads through, puts 검색 / 탐색기 / 목차 back on /en/.
 *
 * Pages outside /ko/ and /en/ — tag pages, 404 — are checked for the opposite:
 * a canonical, and deliberately no switcher and no hreflang.
 *
 *   pnpm blog:build && pnpm blog:test-lang
 */

import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import { fmt } from "./lib/blog.mjs"

const here = path.dirname(url.fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(here, "..")
const PUBLIC_DIR = path.join(REPO_ROOT, "public")

// quartz.config.ts is TypeScript, so read `baseUrl` out of it textually rather
// than dragging a transpiler into a check that has to stay cheap. If the host
// ever moves to a custom domain this picks the new one up on its own.
const configSrc = await fs.readFile(path.join(REPO_ROOT, "quartz.config.ts"), "utf8")
const BASE = `https://${configSrc.match(/baseUrl:\s*"([^"]+)"/)[1]}`
const LANGS = ["ko", "en"]

const problems = []
const bad = (m) => problems.push(m)
const trim = (u) => u.replace(/\/$/, "")

async function walk(dir, rel = "") {
  const out = []
  for (const e of await fs.readdir(path.join(dir, rel), { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name)
    if (e.isDirectory()) out.push(...(await walk(dir, r)))
    else if (e.name.endsWith(".html")) out.push(r)
  }
  return out
}

const attr = (tag, name) => (tag?.match(new RegExp(`${name}="([^"]*)"`, "i")) ?? [])[1]
const all = (html, re) => html.match(re) ?? []

let files
try {
  files = await walk(PUBLIC_DIR)
} catch {
  console.error(fmt.bad(`no public/ — run \`pnpm blog:build\` first`))
  process.exit(1)
}

/** file path in public/ -> the page's parsed head + switcher */
const pages = new Map()
/** absolute canonical URL -> file path, for the mutual-reference check */
const byCanonical = new Map()

for (const file of files) {
  const html = await fs.readFile(path.join(PUBLIC_DIR, file), "utf8")
  if (/<meta http-equiv="refresh"/i.test(html)) continue // the / -> /ko/ redirect

  const urlPath = "/" + file.replace(/index\.html$/, "").replace(/\.html$/, "")
  const tree = urlPath.split("/")[1]
  const page = {
    file,
    urlPath,
    tree: LANGS.includes(tree) ? tree : undefined,
    htmlLang: attr(all(html, /<html[^>]*>/i)[0], "lang"),
    canonical: attr(all(html, /<link rel="canonical"[^>]*>/gi)[0], "href"),
    alts: all(html, /<link rel="alternate" hrefLang="[^"]*"[^>]*>/gi).map((t) => ({
      lang: attr(t, "hrefLang"),
      href: attr(t, "href"),
    })),
    switcher: (html.match(/<div class="language-switcher"[\s\S]*?<\/div>/) ?? [""])[0],
    html,
  }
  pages.set(file, page)
  if (page.canonical) byCanonical.set(trim(page.canonical), page)
}

// ── 1. self-canonical ───────────────────────────────────────────────────────
for (const p of pages.values()) {
  if (trim(p.canonical ?? "") !== trim(BASE + p.urlPath)) {
    bad(`${p.file}: canonical is ${p.canonical ?? "missing"}, expected ${BASE + p.urlPath}`)
  }
}

// ── 2/3. language pages ─────────────────────────────────────────────────────
let paired = 0
let solo = 0
let switcherLinks = 0
let disabled = 0

for (const p of pages.values()) {
  if (!p.tree) continue

  if (p.htmlLang !== p.tree) {
    bad(`${p.file}: <html lang="${p.htmlLang}"> but the page is under /${p.tree}/`)
  }

  const alts = p.alts.filter((a) => a.lang !== "x-default")
  const self = alts.find((a) => a.lang === p.tree)
  if (!self) bad(`${p.file}: hreflang set omits its own language (${p.tree})`)
  else if (trim(self.href) !== trim(BASE + p.urlPath)) {
    bad(`${p.file}: self hreflang points at ${self.href}`)
  }
  if (!p.alts.some((a) => a.lang === "x-default")) bad(`${p.file}: no x-default hreflang`)

  if (alts.length > 1) paired++
  else solo++

  for (const a of alts) {
    if (a.lang === p.tree) continue
    const other = byCanonical.get(trim(a.href))
    if (!other) {
      bad(`${p.file}: hreflang ${a.lang} -> ${a.href} is not a page in this build`)
      continue
    }
    const back = other.alts.find((x) => x.lang === p.tree)
    if (!back || trim(back.href) !== trim(BASE + p.urlPath)) {
      bad(`${p.file}: ${a.href} does not reference it back`)
    }
  }

  // ── 4. the switcher ───────────────────────────────────────────────────────
  if (!p.switcher) {
    bad(`${p.file}: no language switcher`)
    continue
  }
  const other = p.tree === "ko" ? "en" : "ko"
  const linkTag = (p.switcher.match(
    new RegExp(`<a class="language-switcher-item"[^>]*hrefLang="${other}"[^>]*>`, "i"),
  ) ?? [])[0]
  const hasDisabled = new RegExp(
    `<span class="language-switcher-item unavailable"[^>]*lang="${other}"`,
    "i",
  ).test(p.switcher)
  const counterpart = p.alts.find((a) => a.lang === other)

  if (counterpart && !linkTag)
    bad(`${p.file}: has an ${other} counterpart but the switcher does not link to it`)
  if (!counterpart && !hasDisabled)
    bad(`${p.file}: no ${other} counterpart and the switcher is not disabled`)

  if (hasDisabled) {
    disabled++
    if (/<a[^>]*language-switcher-item unavailable/.test(p.switcher)) {
      bad(`${p.file}: the disabled half of the switcher is an anchor — it will 404`)
    }
    if (!/aria-disabled="true"/.test(p.switcher))
      bad(`${p.file}: disabled switcher item has no aria-disabled`)
  }

  if (linkTag) {
    switcherLinks++
    const href = attr(linkTag, "href")
    // Resolve the relative href the way a browser would, then find the file.
    const target = new URL(href, "https://x" + p.urlPath).pathname
    const targetFile = target.endsWith("/")
      ? target.slice(1) + "index.html"
      : target.slice(1) + ".html"
    const dest = pages.get(targetFile)
    if (!dest) {
      bad(`${p.file}: switcher href ${href} resolves to ${target}, which this build did not emit`)
      continue
    }
    if (dest.tree !== other) bad(`${p.file}: switcher ${other} link lands on a /${dest.tree}/ page`)
    const backHref = attr(
      (dest.switcher.match(
        new RegExp(`<a class="language-switcher-item"[^>]*hrefLang="${p.tree}"[^>]*>`, "i"),
      ) ?? [])[0],
      "href",
    )
    if (!backHref) {
      bad(`${p.file}: ${dest.file} does not link back`)
    } else {
      const backPath = new URL(backHref, "https://x" + dest.urlPath).pathname
      if (trim(backPath) !== trim(p.urlPath)) {
        bad(`${p.file}: round trip through ${dest.file} lands on ${backPath}`)
      }
    }
  }
}

// ── 5. the chrome is in the page's own language ─────────────────────────────
//
// Each slot below is read out of the page where exactly one component renders
// it, and compared against that component's string in BOTH locales. Reading a
// slot rather than grepping the whole document is what makes the check usable
// in both directions: a Korean post about search engines contains the word
// "Search" in its prose, and Quartz itself hardcodes English outside i18n (the
// `<title>Search</title>` inside the search icon, `aria-label="Global Graph"`,
// the breadcrumb root "Home"), so no vocabulary scan over the whole page could
// tell chrome from content. The slot is the unit of the claim.
//
// A slot that is absent is skipped, not failed — the layout puts the table of
// contents and the graph only on some page types.

const CHROME = {
  ko: {
    search: "검색",
    searchPlaceholder: "검색어를 입력하세요",
    explorer: "탐색기",
    tableOfContents: "목차",
    graph: "그래프 뷰",
    backlinks: "백링크",
    darkMode: "다크 모드",
    lightMode: "라이트 모드",
    readerMode: "리더 모드",
    folderTitlePrefix: "폴더",
  },
  en: {
    search: "Search",
    searchPlaceholder: "Search for something",
    explorer: "Explorer",
    tableOfContents: "Table of Contents",
    graph: "Graph View",
    backlinks: "Backlinks",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    readerMode: "Reader mode",
    folderTitlePrefix: "Folder",
  },
}

const SLOTS = {
  search: /<button class="search-button">[\s\S]*?<p>([^<]*)<\/p>/,
  searchPlaceholder: /class="search-bar"[^>]*placeholder="([^"]*)"/,
  explorer: /desktop-explorer"[^>]*><h2>([^<]*)<\/h2>/,
  tableOfContents: /class="toc-header"[^>]*><h3>([^<]*)<\/h3>/,
  graph: /<div class="graph"><h3>([^<]*)<\/h3>/,
  backlinks: /<div class="backlinks"[\s\S]*?<h3>([^<]*)<\/h3>/,
  darkMode: /class="dayIcon"[^>]*aria-label="([^"]*)"/,
  lightMode: /class="nightIcon"[^>]*aria-label="([^"]*)"/,
  readerMode: /class="readerIcon"[^>]*aria-label="([^"]*)"/,
  // The generated title of a folder page — "Folder: en/engineering". Invented
  // by the folder-page emitter, not by a component, so it is the one string
  // the per-page locale in renderPage cannot reach on its own.
  folderTitlePrefix: /<h1 class="article-title">([^<:]+): [a-z]/,
}

// Dates come from `cfg.locale` too, via Intl, so they regress the same way.
const DATE_SHAPE = {
  ko: /^\d{4}년 \d{1,2}월 \d{1,2}일$/,
  en: /^[A-Z][a-z]{2} \d{2}, \d{4}$/,
}

let slotsChecked = 0
let datesChecked = 0

for (const p of pages.values()) {
  if (!p.tree) continue
  const mine = CHROME[p.tree]
  const theirs = CHROME[p.tree === "ko" ? "en" : "ko"]

  for (const [slot, re] of Object.entries(SLOTS)) {
    const found = (p.html.match(re) ?? [])[1]
    if (found === undefined) continue // this page type does not render it
    slotsChecked++
    if (found === mine[slot]) continue
    if (found === theirs[slot]) {
      bad(
        `${p.file}: ${slot} is "${found}" — that is the other language's chrome on a /${p.tree}/ page`,
      )
    } else {
      bad(`${p.file}: ${slot} is "${found}", expected "${mine[slot]}"`)
    }
  }

  const stamped = (p.html.match(/<p[^>]*class="content-meta"[^>]*><time[^>]*>([^<]*)<\/time>/) ??
    [])[1]
  if (stamped !== undefined) {
    datesChecked++
    if (!DATE_SHAPE[p.tree].test(stamped)) {
      bad(`${p.file}: date "${stamped}" is not formatted for /${p.tree}/`)
    }
  }

  // A net wider than the named slots, for the direction where one is possible.
  // Nothing in the left sidebar is page content — the explorer tree is built
  // in the browser from contentIndex.json, so server-side it is an empty <ul>
  // — which makes "no Hangul here" a safe way to catch chrome this file does
  // not yet know about. The mirror of this check cannot exist: English words
  // in a /ko/ sidebar are Quartz's own hardcoded labels, not a regression.
  if (p.tree === "en") {
    const sidebar = (p.html.match(/<div class="left sidebar">[\s\S]*?<div class="center">/) ?? [
      "",
    ])[0]
    const hangul = [...new Set(sidebar.match(/[가-힣]+/g) ?? [])]
    if (hangul.length) {
      bad(`${p.file}: Korean in the left sidebar of an /en/ page: ${hangul.join(", ")}`)
    }
  }
}

// ── pages outside the language trees ────────────────────────────────────────
let outside = 0
for (const p of pages.values()) {
  if (p.tree) continue
  outside++
  if (p.switcher) bad(`${p.file}: has a switcher but is not under /ko/ or /en/`)
  if (p.alts.length) bad(`${p.file}: has hreflang but is not under /ko/ or /en/`)
}

console.log(fmt.head(`bilingual check — public/`))
for (const p of problems) console.error(fmt.bad(p))
if (problems.length) {
  console.error(`\n${problems.length} problem(s).`)
  process.exit(1)
}

console.log(
  fmt.ok(
    `${pages.size} page(s): all self-canonical · ${paired} in a KO/EN pair, ${solo} single-language · ` +
      `${switcherLinks} switcher link(s) resolve and round-trip · ${disabled} disabled span(s) · ` +
      `${slotsChecked} chrome slot(s) and ${datesChecked} date(s) in the page's own language · ` +
      `${outside} page(s) outside the language trees, correctly without either`,
  ),
)
