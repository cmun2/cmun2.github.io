#!/usr/bin/env node
/**
 * STEP 1 of `blog:publish` — frontmatter contract.
 *
 * Every Markdown file under the vault's Public/ tree must satisfy:
 *
 *   title:          non-empty
 *   lang:           ko | en, and it must agree with the directory it sits in
 *   translationKey: a string, unique within its language
 *   publish:        an actual boolean
 *   date:           YYYY-MM-DD
 *   tags:           a list (optional)
 *
 * Exits non-zero and names every offending file. It does not fix anything —
 * a validator that edits your notes is a validator you stop reading.
 */

import path from "node:path"
import {
  BlogError,
  LANGS,
  VAULT_PUBLIC,
  fmt,
  readPublicNotes,
  validateFrontmatter,
} from "./lib/blog.mjs"

async function main() {
  console.log(fmt.head(`validate — ${VAULT_PUBLIC}`))

  let notes
  try {
    notes = await readPublicNotes()
  } catch (err) {
    if (err instanceof BlogError) {
      console.error(fmt.bad(err.message))
      process.exit(1)
    }
    throw err
  }

  const problems = []
  for (const note of notes) {
    problems.push(...validateFrontmatter(note.data, note.rel))
  }

  // translationKey must be unique WITHIN a language. Across languages it is
  // supposed to collide — that collision is exactly what pairs KO with EN.
  const byLang = new Map(LANGS.map((l) => [l, new Map()]))
  for (const note of notes) {
    const lang = note.data.lang
    const key = note.data.translationKey
    if (!byLang.has(lang) || typeof key !== "string") continue
    const seen = byLang.get(lang)
    if (seen.has(key)) {
      problems.push(
        `${note.rel}: translationKey "${key}" is already used by ${seen.get(key)} in the same language (${lang}). ` +
          `Two ${lang} pages cannot both claim to be the ${lang} version of one post.`,
      )
    } else {
      seen.set(key, note.rel)
    }
  }

  const published = notes.filter((n) => n.data.publish === true)
  const held = notes.length - published.length

  // Pairing summary — not a failure, just visibility into how much of the
  // English side exists.
  const pairs = new Map()
  for (const n of published) {
    if (typeof n.data.translationKey !== "string") continue
    const set = pairs.get(n.data.translationKey) ?? new Set()
    set.add(n.data.lang)
    pairs.set(n.data.translationKey, set)
  }
  const paired = [...pairs.values()].filter((s) => s.size > 1).length

  for (const p of problems) console.error(fmt.bad(p))

  if (problems.length) {
    console.error(`\n${problems.length} problem(s). Nothing was copied.`)
    process.exit(1)
  }

  console.log(
    fmt.ok(
      `${notes.length} notes valid — ${published.length} with publish: true, ` +
        `${held} held back, ${paired} KO/EN pair(s)`,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
