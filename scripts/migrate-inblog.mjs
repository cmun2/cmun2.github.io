#!/usr/bin/env node
/**
 * ONE-SHOT migration: cmun2.inblog.io → Obsidian vault `Public/` tree.
 *
 * This is not a scraper and must never become one. It runs once, by hand,
 * against the author's own public blog, sequentially, with a delay between
 * requests, and writes nothing that is not already public. There is no
 * schedule, no daemon, no retry storm. Once the vault holds the Markdown, this
 * file exists only as a record of how the content got there.
 *
 *   node scripts/migrate-inblog.mjs --dry-run     # convert, report, write nothing
 *   node scripts/migrate-inblog.mjs               # convert and write
 *
 * Flags:
 *   --dry-run        parse and report, do not write
 *   --cache <dir>    where fetched HTML is kept (default .migration-cache/)
 *   --no-fetch       fail rather than hit the network; use the cache only
 *   --out <dir>      target vault Public/ dir (default the vault path below)
 */

import fs from "node:fs/promises"
import path from "node:path"
import { unified } from "unified"
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import remarkStringify from "remark-stringify"
import remarkGfm from "remark-gfm"
import { BY_ID, POSTS } from "./inblog-map.mjs"

const SITEMAP = "https://cmun2.inblog.io/sitemap.xml"
const DEFAULT_OUT = path.join(VAULT_ROOT, "Public")
const USER_AGENT =
  "cmun2-blog-migration/1.0 (one-shot personal archive of my own posts; contact via github.com/cmun2)"
const POLITE_DELAY_MS = 1500

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const DRY_RUN = flag("dry-run")
const NO_FETCH = flag("no-fetch")
const CACHE_DIR = path.resolve(opt("cache", ".migration-cache"))
const OUT_DIR = path.resolve(opt("out", DEFAULT_OUT))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── fetch, cached ───────────────────────────────────────────────────────────

let didFetch = false
async function fetchCached(url, cacheName) {
  const cachePath = path.join(CACHE_DIR, cacheName)
  try {
    const cached = await fs.readFile(cachePath, "utf8")
    if (cached.length > 0) return cached
  } catch {
    /* not cached yet */
  }

  if (NO_FETCH) throw new Error(`--no-fetch given but ${url} is not in the cache`)

  // Sequential and slow on purpose.
  if (didFetch) await sleep(POLITE_DELAY_MS)
  didFetch = true

  process.stderr.write(`  fetching ${url}\n`)
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  const body = await res.text()

  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(cachePath, body)
  return body
}

// ─── html scraping helpers ───────────────────────────────────────────────────

const unescapeEntities = (s) =>
  s
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")

function metaContent(html, attr, value) {
  const re = new RegExp(
    `<meta ${attr}="${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" content="(.*?)"\\s*/?>`,
  )
  const m = html.match(re)
  return m ? unescapeEntities(m[1]) : undefined
}

function allMetaContent(html, attr, value) {
  const re = new RegExp(`<meta ${attr}="${value}" content="(.*?)"\\s*/?>`, "g")
  return [...html.matchAll(re)].map((m) => unescapeEntities(m[1]))
}

const ARTICLE_MARKER = 'class="px-5 w-full tiptap"><html><head></head><body>'

/**
 * Pull the article out of inblog's rendered page.
 *
 * inblog nests a whole `<html><head></head><body>` inside the article div and
 * never closes it, so you cannot find the end by looking for `</body>` — that
 * belongs to the outer document and everything between it and the article
 * (site footer, Next.js hydration templates) would come along. Instead, count
 * `<div>` depth from the article div until it closes.
 */
function extractArticleHtml(html) {
  const marker = html.indexOf(ARTICLE_MARKER)
  if (marker < 0) return undefined
  const start = html.indexOf("<body>", marker) + "<body>".length

  let depth = 1
  const re = /<(\/?)div\b/g
  re.lastIndex = start
  let m
  while ((m = re.exec(html)) !== null) {
    depth += m[1] ? -1 : 1
    if (depth === 0) return html.slice(start, m.index)
  }
  return undefined
}

// ─── images ──────────────────────────────────────────────────────────────────

/**
 * inblog serves images through an `image.inblog.dev?url=<encoded>&w=…&q=…`
 * resizing proxy. Unwrap it and take the original from source.inblog.dev so
 * the archived copy is full resolution rather than whatever width the page
 * happened to request.
 */
function originalImageUrl(src) {
  try {
    const u = new URL(src, "https://image.inblog.dev")
    const inner = u.searchParams.get("url")
    if (inner) return inner
    return u.toString()
  } catch {
    return src
  }
}

function extensionFor(url, contentType) {
  const fromType = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  }[(contentType ?? "").split(";")[0].trim()]
  if (fromType) return fromType
  const m = url.match(/\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i)
  return m ? `.${m[1].toLowerCase().replace("jpeg", "jpg")}` : ".png"
}

async function downloadImage(url, destDirAbs, baseName) {
  if (DRY_RUN) return `${baseName}.png`

  // Idempotent: a re-run to fix the Markdown conversion must not re-download
  // 165 images from someone else's server.
  try {
    const existing = await fs.readdir(destDirAbs)
    const hit = existing.find((f) => f.replace(/\.[^.]+$/, "") === baseName)
    if (hit) return hit
  } catch {
    /* dir does not exist yet */
  }

  if (didFetch) await sleep(POLITE_DELAY_MS)
  didFetch = true

  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } })
  if (!res.ok) throw new Error(`image ${url} → HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const ext = extensionFor(url, res.headers.get("content-type"))
  await fs.mkdir(destDirAbs, { recursive: true })
  await fs.writeFile(path.join(destDirAbs, baseName + ext), buf)
  return baseName + ext
}

// ─── html → markdown ─────────────────────────────────────────────────────────

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark, {
    handlers: {
      // inblog wraps every image in <figure><img><figcaption>. Turn the caption
      // into a plain paragraph rather than dropping it.
      figure(state, node) {
        const result = state.all(node)
        return result
      },
      figcaption(state, node) {
        return { type: "paragraph", children: state.all(node) }
      },
    },
  })
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: "-",
    fence: "`",
    fences: true,
    emphasis: "_",
    strong: "*",
    rule: "-",
    listItemIndent: "one",
    // Korean text is full of characters remark would otherwise escape into
    // noise; only escape what actually needs it.
    handlers: {},
  })

/**
 * inblog renders code blocks as `<pre><code class="language-auto">` with
 * highlight.js `<span>`s inside. The spans must go (they are presentation) and
 * `language-auto` is not a language, so guess one from the code itself — a
 * fenced block with no language loses syntax highlighting on the new site.
 */
function guessLanguage(code, hintedLang) {
  if (hintedLang && hintedLang !== "auto" && hintedLang !== "plaintext") return hintedLang
  const t = code.trim()
  if (/^\s*[{[]/.test(t) && /["}\]]\s*$/.test(t) && !/\bfunction\b|=>/.test(t)) return "json"
  if (/^\s*(FROM|RUN|COPY|CMD|ENTRYPOINT)\s/m.test(t)) return "dockerfile"
  if (/^\s*(pipeline|stage|steps)\s*\{/m.test(t)) return "groovy"
  if (/<template>|<script setup|v-if=|v-for=/.test(t)) return "vue"
  if (/^\s*<[a-zA-Z]/.test(t) && /<\/[a-zA-Z]+>/.test(t)) return "html"
  if (/^\s*[\w.-]+:\s*$/m.test(t) && !/[;{}]/.test(t) && /^\s{2,}[\w-]+:/m.test(t)) return "yaml"
  if (/\b(interface|type\s+\w+\s*=|: string|: number|<T[,>]|as const)\b/.test(t))
    return "typescript"
  if (/\b(const|let|function|=>|import|export|await|async)\b/.test(t)) return "javascript"
  if (/^\s*(npm|pnpm|yarn|git|docker|cd|mkdir|curl|export)\s/m.test(t)) return "bash"
  if (/^[.#]?[\w-]+\s*\{[^}]*:[^}]*;/m.test(t)) return "css"
  return ""
}

/** Strip highlight.js markup and normalise images, before the mdast conversion. */
async function preprocessArticle(html, ctx) {
  let out = html

  // 1. Code blocks: unwrap hljs spans, decode entities, pick a language.
  const blocks = []
  out = out.replace(
    /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g,
    (_all, codeAttrs, inner) => {
      const langAttr = (codeAttrs.match(/class="language-([\w-]+)"/) ?? [])[1]
      const text = unescapeEntities(inner.replace(/<[^>]+>/g, ""))
      const lang = guessLanguage(text, langAttr)
      const token = `@@CODEBLOCK${blocks.length}@@`
      blocks.push({ lang, text: text.replace(/\n+$/, "") })
      return `<p>${token}</p>`
    },
  )

  // 2. Images: download originals, rewrite src to a repo-relative path.
  const imgRe = /<img\b[^>]*>/g
  const imgs = [...out.matchAll(imgRe)]
  let imgIndex = 0
  for (const m of imgs) {
    const tag = m[0]
    const srcMatch = tag.match(/\ssrc="([^"]+)"/)
    if (!srcMatch) continue
    const src = unescapeEntities(srcMatch[1])
    const original = originalImageUrl(src)
    imgIndex += 1
    const baseName = String(imgIndex).padStart(2, "0")
    let fileName
    try {
      fileName = await downloadImage(original, ctx.imageDirAbs, baseName)
      ctx.imagesDownloaded += 1
    } catch (err) {
      ctx.imageFailures.push({ url: original, error: String(err) })
      continue
    }
    const rel = `${ctx.imageDirRel}/${fileName}`
    const alt = (tag.match(/\salt="([^"]*)"/) ?? [, ""])[1]
    out = out.replace(tag, `<img src="${rel}" alt="${alt}">`)
  }
  // Drop srcset/sizes leftovers that would confuse the converter.
  out = out.replace(/\s(srcset|sizes|loading|decoding|data-[\w-]+)="[^"]*"/g, "")

  // 3. inblog's editor emits `<p></p>` spacers and `<span>` soup. Flatten.
  out = out.replace(/<span[^>]*>/g, "").replace(/<\/span>/g, "")
  out = out.replace(/<p[^>]*>\s*<\/p>/g, "")

  const file = await processor.process(out)
  let md = String(file)

  // 4. Put the code blocks back, now as real fenced blocks.
  md = md.replace(/@@CODEBLOCK(\d+)@@/g, (_all, i) => {
    const { lang, text } = blocks[Number(i)]
    const fence = text.includes("```") ? "````" : "```"
    return `${fence}${lang}\n${text}\n${fence}`
  })

  // 5. Tidy: collapse >2 blank lines, strip escaped Korean punctuation noise.
  md = md.replace(/\n{3,}/g, "\n\n").trim()

  return { markdown: md, codeBlocks: blocks.length, images: imgIndex }
}

// ─── frontmatter ─────────────────────────────────────────────────────────────

const yamlString = (s) => {
  const needsQuote = /^[\s>|@`%&*!#{}[\],?:-]|[:#]\s|["']|\n|^$/.test(s)
  return needsQuote ? `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : s
}

function frontmatter(fields) {
  const lines = ["---"]
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) lines.push(`${k}: [${v.map(yamlString).join(", ")}]`)
    else if (typeof v === "boolean") lines.push(`${k}: ${v}`)
    else lines.push(`${k}: ${yamlString(String(v))}`)
  }
  lines.push("---")
  return lines.join("\n")
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`inblog migration — ${DRY_RUN ? "DRY RUN" : "writing"} → ${OUT_DIR}\n`)

  // The sitemap is the source of truth for what exists. Cross-check it against
  // the curated map so a post added since the map was written is not silently
  // skipped.
  const sitemap = await fetchCached(SITEMAP, "sitemap.xml")
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const postUrls = urls.filter(
    (u) => !u.includes("/category/") && !u.includes("/author/") && u !== "https://cmun2.inblog.io",
  )

  const idOf = (u) => (u.match(/-?(\d+)$/) ?? [])[1]
  const seen = new Set()
  const report = []
  const problems = []

  for (const url of postUrls) {
    const id = idOf(url)
    const entry = BY_ID.get(id)
    if (!entry) {
      problems.push(`sitemap has post id ${id} (${url}) with no entry in inblog-map.mjs`)
      continue
    }
    seen.add(id)

    const html = await fetchCached(url, `${id}.html`)

    const rawTitle = metaContent(html, "property", "og:title") ?? ""
    const title = rawTitle.replace(/\s*-\s*cmun2$/, "").trim()
    const published = metaContent(html, "property", "article:published_time")
    const modified = metaContent(html, "property", "article:modified_time")
    const description = metaContent(html, "name", "description")
    const sourceTags = allMetaContent(html, "property", "article:tag")

    const article = extractArticleHtml(html)
    if (!article) {
      problems.push(`${id} (${title}): could not locate the article body in the page`)
      continue
    }

    const destDirAbs = path.join(OUT_DIR, entry.lang, entry.section)
    const imageDirRel = `images/${entry.slug}`
    const ctx = {
      imageDirAbs: path.join(destDirAbs, imageDirRel),
      imageDirRel,
      imagesDownloaded: 0,
      imageFailures: [],
    }

    const { markdown, codeBlocks, images } = await preprocessArticle(article, ctx)

    const fm = frontmatter({
      title,
      lang: entry.lang,
      translationKey: entry.key,
      publish: true,
      date: (published ?? modified ?? "").slice(0, 10) || undefined,
      modified: (modified ?? "").slice(0, 10) || undefined,
      tags: entry.tags,
      description,
      // Provenance. `sourceUrl` also lets the old blog stay up without the two
      // competing for the same search result.
      sourceUrl: url,
      sourceId: id,
      sourceCategory: sourceTags[0],
    })

    const body = `${fm}\n\n${markdown}\n`
    const destFile = path.join(destDirAbs, `${entry.slug}.md`)

    if (!DRY_RUN) {
      await fs.mkdir(destDirAbs, { recursive: true })
      await fs.writeFile(destFile, body)
    }

    report.push({
      id,
      lang: entry.lang,
      section: entry.section,
      slug: entry.slug,
      title,
      date: (published ?? "").slice(0, 10),
      chars: markdown.length,
      codeBlocks,
      images,
      imagesOk: ctx.imagesDownloaded,
      imageFailures: ctx.imageFailures,
    })
    console.log(
      `  ✓ ${entry.lang}/${entry.section}/${entry.slug}.md  ` +
        `(${markdown.length} chars, ${codeBlocks} code blocks, ${ctx.imagesDownloaded}/${images} images)`,
    )
  }

  for (const p of POSTS) {
    if (!seen.has(p.id)) problems.push(`inblog-map.mjs lists id ${p.id} but the sitemap does not`)
  }

  console.log(`\n${report.length} posts converted.`)
  const failedImages = report.flatMap((r) => r.imageFailures)
  if (failedImages.length) {
    console.log(`\n${failedImages.length} images failed:`)
    for (const f of failedImages) console.log(`  ${f.url}\n    ${f.error}`)
  }
  if (problems.length) {
    console.log("\nProblems:")
    for (const p of problems) console.log(`  ! ${p}`)
  }

  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(path.join(CACHE_DIR, "report.json"), JSON.stringify(report, null, 2))
  console.log(`\nPer-post report: ${path.join(CACHE_DIR, "report.json")}`)

  if (problems.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
