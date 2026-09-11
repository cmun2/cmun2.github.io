#!/usr/bin/env node
/**
 * STEP 4 of `blog:publish` — broken internal links and missing images.
 *
 * Runs against content/ (after the sync) rather than the built site, so a bad
 * link is caught before 300 files are emitted around it.
 *
 * Checks:
 *   - every relative Markdown link resolves to a real note in content/
 *   - every image reference resolves to a real file in content/
 *   - every wiki-link [[…]] resolves (Obsidian writes these; Quartz resolves
 *     them by filename, so a rename in the vault silently breaks them)
 *   - a KO page whose `translationKey` matches nothing is reported as INFO,
 *     not an error — that is the normal state of this site
 *
 * External http(s) links are NOT fetched. Doing so would turn a build step
 * into a crawler, be slow, and fail on other people's rate limits.
 */

import fs from "node:fs/promises"
import path from "node:path"
import { CONTENT_DIR, fmt, parseFrontmatter, walk } from "./lib/blog.mjs"

const errors = []
const infos = []

const MD_LINK = /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const WIKI_LINK = /!?\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log(fmt.head("link check — content/"))

  const files = (await walk(CONTENT_DIR)).filter((f) => f.endsWith(".md"))
  const allFiles = new Set(await walk(CONTENT_DIR))
  const slugs = new Set(files.map((f) => f.replace(/\.md$/, "")))
  const stems = new Map()
  for (const f of files) stems.set(path.basename(f, ".md"), f)

  // Quartz emits a folder listing page for every directory that actually
  // contains a note. An EMPTY directory gets no page, so `projects/` is a
  // broken link until the first project post exists — which is the correct
  // answer, not a false positive.
  const folderPages = new Set()
  for (const f of files) {
    let dir = path.dirname(f)
    while (dir !== "." && dir !== path.sep) {
      folderPages.add(dir)
      dir = path.dirname(dir)
    }
  }

  const keys = new Map() // translationKey -> Set(lang)

  let checked = 0

  for (const rel of files) {
    const abs = path.join(CONTENT_DIR, rel)
    const raw = await fs.readFile(abs, "utf8")
    const { data, body } = parseFrontmatter(raw, rel)

    if (typeof data.translationKey === "string") {
      const set = keys.get(data.translationKey) ?? new Set()
      set.add(data.lang)
      keys.set(data.translationKey, set)
    }

    const dir = path.dirname(rel)

    for (const m of body.matchAll(MD_LINK)) {
      const [, bang, , target] = m
      checked += 1
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue

      const clean = decodeURIComponent(target.split("#")[0])
      if (clean === "") continue

      const resolved = path.normalize(path.join(dir, clean))

      if (bang === "!") {
        if (!allFiles.has(resolved)) {
          errors.push(`${rel}: image not found → ${target} (looked for content/${resolved})`)
        }
        continue
      }

      // A link may target a note, a note without its .md, or a folder page.
      const candidates = [
        resolved,
        `${resolved}.md`,
        path.join(resolved, "index.md"),
        resolved.replace(/\/$/, ""),
      ]
      const asFolder = resolved.replace(/\/$/, "")
      const ok =
        folderPages.has(asFolder) ||
        candidates.some((c) => allFiles.has(c) || slugs.has(c) || slugs.has(c.replace(/\.md$/, "")))
      if (!ok) {
        errors.push(`${rel}: link not found → ${target} (looked for content/${resolved})`)
      }
    }

    for (const m of body.matchAll(WIKI_LINK)) {
      checked += 1
      const stem = path.basename(m[1].trim())
      if (!stems.has(stem) && !slugs.has(m[1].trim())) {
        errors.push(`${rel}: wiki-link [[${m[1]}]] does not resolve to any note`)
      }
    }
  }

  for (const [key, langs] of keys) {
    if (langs.size === 1) {
      const only = [...langs][0]
      infos.push(`${key}: only exists in ${only}`)
    }
  }

  for (const e of errors) console.error(fmt.bad(e))

  if (errors.length) {
    console.error(`\n${errors.length} broken link(s). Not building.`)
    process.exit(1)
  }

  console.log(fmt.ok(`${checked} link(s) across ${files.length} note(s), none broken`))
  console.log(
    `  ${infos.length} page(s) exist in one language only — expected, the English side is new`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
