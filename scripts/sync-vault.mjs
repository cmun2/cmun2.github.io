#!/usr/bin/env node
/**
 * STEP 3 of `blog:publish` — copy Public/ → content/.
 *
 * Reads from exactly one directory: the vault's Public/ tree. It has no
 * notion of the rest of the vault and no way to reach it — see
 * check-private-paths.mjs for why that is the design.
 *
 * The copy is a MIRROR, not an append: a note whose `publish` flips to false,
 * or that is deleted from Public/, is removed from content/ on the next sync.
 * Otherwise unpublishing would be a no-op, which is the worst possible
 * behaviour for this particular repo.
 *
 *   node scripts/sync-vault.mjs             # sync
 *   node scripts/sync-vault.mjs --dry-run   # show the plan
 */

import fs from "node:fs/promises"
import path from "node:path"
import {
  BlogError,
  CONTENT_DIR,
  VAULT_PUBLIC,
  assertInside,
  fmt,
  parseFrontmatter,
  validateFrontmatter,
  walk,
} from "./lib/blog.mjs"

const DRY_RUN = process.argv.includes("--dry-run")

/** Files content/ owns itself and the sync must never delete. */
const CONTENT_OWNED = new Set(["index.md"])

async function main() {
  console.log(fmt.head(`sync — Public/ → content/${DRY_RUN ? "  (dry run)" : ""}`))

  const sourceFiles = await walk(VAULT_PUBLIC)
  const wanted = new Map() // relative path in content/ -> absolute source
  const problems = []

  for (const rel of sourceFiles) {
    const abs = path.join(VAULT_PUBLIC, rel)

    // GATE 1, re-checked here rather than trusted from an earlier step: this
    // script must be safe to run on its own.
    try {
      await assertInside(VAULT_PUBLIC, abs, "refusing to copy a file from outside Public/")
    } catch (err) {
      if (err instanceof BlogError) {
        problems.push(err.message)
        continue
      }
      throw err
    }

    if (!rel.endsWith(".md")) {
      // Assets (images) ride along with whatever note references them; they
      // are copied unconditionally because they live inside Public/ already.
      wanted.set(rel, abs)
      continue
    }

    let parsed
    try {
      parsed = parseFrontmatter(await fs.readFile(abs, "utf8"), `Public/${rel}`)
    } catch (err) {
      if (err instanceof BlogError) {
        problems.push(err.message)
        continue
      }
      throw err
    }

    const fmProblems = validateFrontmatter(parsed.data, rel)
    if (fmProblems.length) {
      problems.push(...fmProblems)
      continue
    }

    // GATE 2.
    if (parsed.data.publish !== true) continue

    wanted.set(rel, abs)
  }

  if (problems.length) {
    for (const p of problems) console.error(fmt.bad(p))
    console.error(`\n${problems.length} problem(s). Nothing was copied.`)
    process.exit(1)
  }

  const existing = await walk(CONTENT_DIR)
  const stale = existing.filter((rel) => !CONTENT_OWNED.has(rel) && !wanted.has(rel))

  let copied = 0
  let unchanged = 0
  for (const [rel, src] of wanted) {
    const dest = path.join(CONTENT_DIR, rel)
    const srcBuf = await fs.readFile(src)
    let same = false
    try {
      same = Buffer.compare(srcBuf, await fs.readFile(dest)) === 0
    } catch {
      /* not there yet */
    }
    if (same) {
      unchanged += 1
      continue
    }
    if (!DRY_RUN) {
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.writeFile(dest, srcBuf)
    }
    copied += 1
  }

  for (const rel of stale) {
    console.log(fmt.warn(`removing content/${rel} (no longer published)`))
    if (!DRY_RUN) await fs.rm(path.join(CONTENT_DIR, rel), { force: true })
  }

  if (!DRY_RUN) await pruneEmptyDirs(CONTENT_DIR)

  const md = [...wanted.keys()].filter((r) => r.endsWith(".md")).length
  console.log(
    fmt.ok(
      `${md} note(s) + ${wanted.size - md} asset(s) — ` +
        `${copied} written, ${unchanged} unchanged, ${stale.length} removed`,
    ),
  )
}

async function pruneEmptyDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue
    const sub = path.join(dir, e.name)
    await pruneEmptyDirs(sub)
    if ((await fs.readdir(sub)).length === 0) await fs.rmdir(sub)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
