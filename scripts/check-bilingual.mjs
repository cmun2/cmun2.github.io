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
 *      is the common case: most posts are Korean-only.
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
      `${outside} page(s) outside the language trees, correctly without either`,
  ),
)
