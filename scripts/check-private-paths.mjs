#!/usr/bin/env node
/**
 * STEP 2 of `blog:publish` — the private-path guard.
 *
 * This is the one script in the repo whose failure mode is not "a broken
 * build" but "a private note is now on the public internet, permanently, in
 * git history". It is therefore deliberately paranoid and deliberately dumb:
 * it makes assertions about paths, not judgements about content.
 *
 * TWO INDEPENDENT GATES. Both must hold for a file to be publishable.
 *
 *   GATE 1 — LOCATION. The file's *real* path (symlinks resolved) is inside
 *            the vault's Public/ directory. Not "does not look private";
 *            inside Public/. The other seven vault folders — 00-inbox,
 *            10-projects, 20-career, 30-knowledge, 40-results, 50-lessons,
 *            90-archive — are not filtered out, they are simply never read.
 *
 *   GATE 2 — INTENT. The file's frontmatter says `publish: true`. Not
 *            truthy, not "yes", not absent-means-yes. The boolean `true`.
 *
 * The gates are independent on purpose. Moving a note into Public/ by accident
 * does not publish it; setting publish: true on a private note does not
 * publish it either. Both mistakes have to happen at once.
 *
 * What this script checks:
 *   A. Public/ contains no symlink that escapes it.
 *   B. Every .md under Public/ parses and declares publish explicitly.
 *   C. Every file already in content/ traces back to a Public/ file that
 *      passes both gates — i.e. nothing was hand-dropped into content/ or
 *      left behind by a note that has since been unpublished.
 *   D. No file anywhere in content/ contains a path referencing a private
 *      vault folder (a cheap textual backstop against a leaked absolute path
 *      in, say, an image reference).
 *
 * Any failure: non-zero exit, and the offending file is named.
 */

import fs from "node:fs/promises"
import path from "node:path"
import {
  BlogError,
  CONTENT_DIR,
  VAULT_PUBLIC,
  VAULT_ROOT,
  fmt,
  parseFrontmatter,
  walk,
} from "./lib/blog.mjs"

/** Vault folders that must never contribute a byte to this repo. */
const PRIVATE_VAULT_DIRS = [
  "00-inbox",
  "10-projects",
  "20-career",
  "30-knowledge",
  "40-results",
  "50-lessons",
  "90-archive",
  "_templates",
  ".obsidian",
]

const failures = []
const fail = (msg) => failures.push(msg)

/** A. No symlink under Public/ may point outside Public/. */
async function checkNoEscapingSymlinks(dir, rel = "") {
  let entries
  try {
    entries = await fs.readdir(path.join(dir, rel), { withFileTypes: true })
  } catch {
    return
  }
  const realRoot = await fs.realpath(dir)
  for (const e of entries) {
    const r = path.join(rel, e.name)
    const abs = path.join(dir, r)
    if (e.isSymbolicLink()) {
      let target
      try {
        target = await fs.realpath(abs)
      } catch {
        fail(`GATE 1: Public/${r} is a broken symlink; refusing to guess what it meant`)
        continue
      }
      const relToRoot = path.relative(realRoot, target)
      if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
        fail(
          `GATE 1: Public/${r} is a symlink to ${target}, which is OUTSIDE the Public tree. ` +
            `This is exactly the shape of a private-note leak.`,
        )
      }
      continue
    }
    if (e.isDirectory()) await checkNoEscapingSymlinks(dir, r)
  }
}

/** B. Every note under Public/ parses and states its intent explicitly. */
async function checkPublicNotes() {
  const files = (await walk(VAULT_PUBLIC)).filter((f) => f.endsWith(".md"))
  const publishable = new Map() // rel -> note

  for (const rel of files) {
    const abs = path.join(VAULT_PUBLIC, rel)

    // Re-assert gate 1 per file, with symlinks resolved.
    const realRoot = await fs.realpath(VAULT_PUBLIC)
    const real = await fs.realpath(abs)
    const relToRoot = path.relative(realRoot, real)
    if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
      fail(`GATE 1: Public/${rel} really lives at ${real}, outside the Public tree`)
      continue
    }

    let parsed
    try {
      parsed = parseFrontmatter(await fs.readFile(abs, "utf8"), `Public/${rel}`)
    } catch (err) {
      if (err instanceof BlogError) {
        fail(`GATE 2: ${err.message}`)
        continue
      }
      throw err
    }

    if (!("publish" in parsed.data)) {
      fail(
        `GATE 2: Public/${rel} has no \`publish\` field. Absence is not consent — ` +
          `add \`publish: false\` if it is a draft.`,
      )
      continue
    }
    if (parsed.data.publish !== true) continue // an explicit hold; fine
    publishable.set(rel, parsed.data)
  }

  return publishable
}

/** C. Nothing in content/ that Public/ did not put there. */
async function checkContentProvenance(publishable) {
  const contentFiles = await walk(CONTENT_DIR)
  for (const rel of contentFiles) {
    // Files the site itself owns rather than the vault.
    if (rel === "index.md") continue

    const sourceRel = rel
    if (rel.endsWith(".md")) {
      if (!publishable.has(sourceRel)) {
        fail(
          `GATE 1+2: content/${rel} has no counterpart at Public/${sourceRel} with publish: true. ` +
            `Either it was placed in content/ by hand (never do this — content/ is generated), ` +
            `or the note was unpublished and the stale copy is still here. Run \`pnpm blog:sync\`.`,
        )
      }
      continue
    }

    // Non-Markdown (images). Must exist under Public/ too.
    try {
      await fs.access(path.join(VAULT_PUBLIC, sourceRel))
    } catch {
      fail(`GATE 1: content/${rel} does not exist under Public/. Where did it come from?`)
    }
  }
}

/** D. Textual backstop: no private vault path may appear anywhere in content/. */
async function checkNoPrivatePathStrings() {
  const files = (await walk(CONTENT_DIR)).filter((f) =>
    [".md", ".html", ".txt", ".json"].includes(path.extname(f)),
  )
  const needles = PRIVATE_VAULT_DIRS.map((d) => `${VAULT_ROOT}/${d}`)
  const bareNeedles = PRIVATE_VAULT_DIRS.map((d) => `/${d}/`)

  for (const rel of files) {
    const text = await fs.readFile(path.join(CONTENT_DIR, rel), "utf8")
    for (const n of needles) {
      if (text.includes(n)) fail(`GATE 1: content/${rel} references the private vault path ${n}`)
    }
    for (const n of bareNeedles) {
      if (text.includes(n)) {
        fail(`GATE 1: content/${rel} contains "${n}", which looks like a private vault folder`)
      }
    }
  }
}

async function main() {
  console.log(fmt.head("private-path guard"))
  console.log(`  gate 1 (location): ${VAULT_PUBLIC}`)
  console.log(`  gate 2 (intent):   frontmatter publish: true`)

  await checkNoEscapingSymlinks(VAULT_PUBLIC)
  const publishable = await checkPublicNotes()
  await checkContentProvenance(publishable)
  await checkNoPrivatePathStrings()

  if (failures.length) {
    console.error("")
    for (const f of failures) console.error(fmt.bad(f))
    console.error(
      `\n${failures.length} guard violation(s). REFUSING TO PUBLISH.\n` +
        `Nothing was copied and nothing was built.`,
    )
    process.exit(1)
  }

  console.log(fmt.ok(`${publishable.size} note(s) pass both gates`))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
