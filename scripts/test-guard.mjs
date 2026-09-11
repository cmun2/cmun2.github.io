#!/usr/bin/env node
/**
 * Adversarial test for the private-path guard.
 *
 * A guard nobody has watched fail is a guard nobody knows works. This plants
 * real files that a leak would look like, runs the real pipeline against them,
 * and asserts it refuses — then cleans up. It touches nothing outside
 * Public/ except one read-only decoy note, which it creates and deletes.
 *
 *   pnpm blog:test-guard
 *
 * Each case must FAIL the pipeline. A case that passes is a hole in the guard.
 */

import fs from "node:fs/promises"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { CONTENT_DIR, REPO_ROOT, VAULT_PUBLIC, VAULT_ROOT, fmt } from "./lib/blog.mjs"

const run = promisify(execFile)

const PRIVATE_DECOY = path.join(VAULT_ROOT, "20-career", "GUARD-TEST-salary-negotiation.md")
const PRIVATE_DECOY_BODY = `---
title: Salary negotiation notes
publish: true
lang: ko
translationKey: guard-test-decoy
date: 2026-09-08
---

Current comp, target comp, and what I would say in the room.
If this text ever appears in a build, the guard failed.
`

async function pipelineFails(step) {
  try {
    await run("node", [path.join(REPO_ROOT, "scripts", step)], { cwd: REPO_ROOT })
    return null // exit 0 — did NOT refuse
  } catch (err) {
    return `${err.stdout ?? ""}${err.stderr ?? ""}`
  }
}

const cases = []
const results = []

/** Register a case: setup(), then every named script must exit non-zero. */
function scenario(name, setup, teardown, steps = ["check-private-paths.mjs"]) {
  cases.push({ name, setup, teardown, steps })
}

// ── 1. THE ONE THAT MATTERS: a symlink from Public/ into a private folder ───
scenario(
  "symlink out of Public/ into 20-career/ (a real private note)",
  async () => {
    await fs.mkdir(path.dirname(PRIVATE_DECOY), { recursive: true })
    await fs.writeFile(PRIVATE_DECOY, PRIVATE_DECOY_BODY)
    await fs.symlink(PRIVATE_DECOY, path.join(VAULT_PUBLIC, "ko", "notes", "leak.md"))
  },
  async () => {
    await fs.rm(path.join(VAULT_PUBLIC, "ko", "notes", "leak.md"), { force: true })
    await fs.rm(PRIVATE_DECOY, { force: true })
  },
  ["check-private-paths.mjs", "sync-vault.mjs"],
)

// ── 2. A private note copied (not linked) into Public/ without publish ─────
scenario(
  "note in Public/ with no `publish` field at all",
  async () => {
    await fs.writeFile(
      path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-nopublish.md"),
      `---\ntitle: 미정\nlang: ko\ntranslationKey: guard-test-nopublish\ndate: 2026-09-08\n---\n\n초안.\n`,
    )
  },
  async () =>
    fs.rm(path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-nopublish.md"), { force: true }),
)

// ── 3. Someone drops a file straight into content/, bypassing the vault ────
scenario(
  "file hand-placed in content/ with no Public/ counterpart",
  async () => {
    await fs.writeFile(
      path.join(CONTENT_DIR, "ko", "notes", "guard-test-smuggled.md"),
      `---\ntitle: Smuggled\nlang: ko\ntranslationKey: guard-test-smuggled\npublish: true\ndate: 2026-09-08\n---\n\nThis never went through the vault.\n`,
    )
  },
  async () =>
    fs.rm(path.join(CONTENT_DIR, "ko", "notes", "guard-test-smuggled.md"), { force: true }),
)

// ── 4. Malformed frontmatter — must be an error, not a default ─────────────
scenario(
  "unparseable frontmatter",
  async () => {
    await fs.writeFile(
      path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-broken.md"),
      `---\ntitle: [unclosed\nlang: ko\npublish: true\n---\n\nbody\n`,
    )
  },
  async () =>
    fs.rm(path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-broken.md"), { force: true }),
  ["check-private-paths.mjs", "validate-content.mjs"],
)

// ── 5. lang disagrees with its directory ───────────────────────────────────
scenario(
  "`lang: en` in the ko/ tree",
  async () => {
    await fs.writeFile(
      path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-wronglang.md"),
      `---\ntitle: Wrong lang\nlang: en\ntranslationKey: guard-test-wronglang\npublish: true\ndate: 2026-09-08\n---\n\nbody\n`,
    )
  },
  async () =>
    fs.rm(path.join(VAULT_PUBLIC, "ko", "notes", "guard-test-wronglang.md"), { force: true }),
  ["validate-content.mjs", "sync-vault.mjs"],
)

// ── 6. translationKey collision inside one language ────────────────────────
scenario(
  "two ko/ notes claiming the same translationKey",
  async () => {
    for (const n of ["a", "b"]) {
      await fs.writeFile(
        path.join(VAULT_PUBLIC, "ko", "notes", `guard-test-dup-${n}.md`),
        `---\ntitle: Dup ${n}\nlang: ko\ntranslationKey: guard-test-dup\npublish: true\ndate: 2026-09-08\n---\n\nbody\n`,
      )
    }
  },
  async () => {
    for (const n of ["a", "b"])
      await fs.rm(path.join(VAULT_PUBLIC, "ko", "notes", `guard-test-dup-${n}.md`), { force: true })
  },
  ["validate-content.mjs"],
)

async function main() {
  console.log(fmt.head("guard test — every case below MUST be refused\n"))

  let failures = 0
  for (const c of cases) {
    await c.teardown().catch(() => {})
    await c.setup()
    try {
      for (const step of c.steps) {
        const output = await pipelineFails(step)
        if (output === null) {
          console.log(fmt.bad(`${c.name}\n      → ${step} exited 0. THE GUARD DID NOT CATCH THIS.`))
          failures += 1
        } else {
          const lines = output.split("\n").map((l) => l.replace(/\x1b\[[0-9;]*m/g, "").trim())
          // Show the actual violation, not the banner the script printed first.
          const line =
            lines.find((l) => l.startsWith("✗")) ??
            lines.find((l) => l.includes("GATE") || l.includes("refusing")) ??
            lines.find((l) => l.length > 0) ??
            ""
          console.log(fmt.ok(`${c.name}`))
          console.log(`      ${step} refused: ${line.replace(/^✗\s*/, "").slice(0, 150)}`)
        }
      }
    } finally {
      await c.teardown().catch(() => {})
    }
    results.push(c.name)
  }

  // Make sure teardown really restored the tree.
  const after = await pipelineFails("check-private-paths.mjs")
  if (after !== null) {
    console.log(fmt.bad("\ncleanup failed — the guard still reports problems after teardown:"))
    console.log(after)
    failures += 1
  } else {
    console.log(fmt.ok("\ntree restored; guard is green again"))
  }

  if (failures) {
    console.error(`\n${failures} case(s) were NOT caught. Do not publish.`)
    process.exit(1)
  }
  console.log(`\nAll ${results.length} leak scenarios refused.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
