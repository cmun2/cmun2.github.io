/**
 * Shared constants and helpers for the publish pipeline.
 *
 * The single most important thing in this repo is that a private note never
 * reaches a public GitHub repo. Everything below exists to make that a
 * mechanical property rather than a habit.
 */

import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"

const here = path.dirname(url.fileURLToPath(import.meta.url))

/** Repo root (…/cmun2.github.io). */
export const REPO_ROOT = path.resolve(here, "..", "..")

/** Where Quartz reads Markdown from. Everything here is destined to be public. */
export const CONTENT_DIR = path.join(REPO_ROOT, "content")

/**
 * The Obsidian vault. Note this is OUTSIDE the repo, and the repo's .gitignore
 * plus the guard below make sure nothing from it gets committed except what
 * the sync places in content/.
 */
export const VAULT_ROOT = "/Users/changyong/Documents/Obsidian Vault"

/**
 * ── GATE 1 of 2 ──────────────────────────────────────────────────────────────
 * The ONLY directory the sync is ever allowed to read from. Not the vault
 * root — this one subdirectory. `00-inbox`, `20-career`, `50-lessons` and the
 * rest are unreachable by construction, not by filter.
 */
export const VAULT_PUBLIC = path.join(VAULT_ROOT, "Public")

/** Languages, mirrored from quartz/i18nSite.ts. Kept in sync by hand — there are two. */
export const LANGS = ["ko", "en"]

/** Sections allowed under each language. A typo'd directory is an error, not a new section. */
export const SECTIONS = ["engineering", "projects", "retrospectives", "notes"]

export const REQUIRED_FIELDS = ["title", "lang", "translationKey", "publish", "date"]

export class BlogError extends Error {}

/** Red/green output that still reads fine when piped to a file. */
export const fmt = {
  ok: (s) => `\x1b[32m✓\x1b[0m ${s}`,
  bad: (s) => `\x1b[31m✗\x1b[0m ${s}`,
  warn: (s) => `\x1b[33m!\x1b[0m ${s}`,
  head: (s) => `\x1b[1m${s}\x1b[0m`,
}

/**
 * Resolve a path with symlinks followed, then assert it is inside `root`.
 *
 * Following symlinks matters: a symlink at `Public/ko/notes/leak.md` pointing
 * at `20-career/salary.md` would otherwise pass a naive string prefix check
 * and copy a private note into the repo.
 */
export async function assertInside(root, candidate, why) {
  const realRoot = await fs.realpath(root)
  let realCandidate
  try {
    realCandidate = await fs.realpath(candidate)
  } catch {
    throw new BlogError(`${why}: ${candidate} does not exist`)
  }
  const rel = path.relative(realRoot, realCandidate)
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new BlogError(
      `${why}: ${candidate}\n    resolves to ${realCandidate}\n    which is OUTSIDE ${realRoot}`,
    )
  }
  return realCandidate
}

/** Every file under `dir`, recursively, as paths relative to `dir`. */
export async function walk(dir, rel = "") {
  let entries
  try {
    entries = await fs.readdir(path.join(dir, rel), { withFileTypes: true })
  } catch {
    return []
  }
  const out = []
  for (const e of entries) {
    if (e.name.startsWith(".")) continue
    const r = path.join(rel, e.name)
    if (e.isDirectory()) out.push(...(await walk(dir, r)))
    else out.push(r)
  }
  return out.sort()
}

/**
 * Split and parse YAML frontmatter.
 *
 * Deliberately strict. A note with no frontmatter, or frontmatter that does not
 * parse, is an error rather than a document with default values — "it had no
 * `publish` field so we assumed false" is one refactor away from "it had no
 * `publish` field so we assumed true".
 */
export function parseFrontmatter(raw, label) {
  if (!raw.startsWith("---")) {
    throw new BlogError(`${label}: no YAML frontmatter block (file must start with '---')`)
  }
  const end = raw.indexOf("\n---", 3)
  if (end < 0) {
    throw new BlogError(`${label}: frontmatter block is never closed (missing the second '---')`)
  }
  const block = raw.slice(raw.indexOf("\n") + 1, end + 1)
  const body = raw.slice(raw.indexOf("\n", end + 1) + 1)

  let data
  try {
    data = yaml.load(block, { schema: yaml.JSON_SCHEMA })
  } catch (err) {
    throw new BlogError(`${label}: frontmatter is not valid YAML — ${err.message}`)
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new BlogError(`${label}: frontmatter must be a YAML mapping, got ${typeof data}`)
  }
  return { data, body }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Enforce the frontmatter contract on one file.
 *
 * `relPath` is relative to Public/ — e.g. `ko/engineering/network-sse.md`.
 * Returns a list of human-readable problems; empty means the file is fine.
 */
export function validateFrontmatter(data, relPath) {
  const problems = []
  const label = relPath

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      problems.push(`${label}: missing required frontmatter field \`${field}\``)
    }
  }

  const segments = relPath.split(path.sep)
  const dirLang = segments[0]
  const dirSection = segments[1]

  if (!LANGS.includes(dirLang)) {
    problems.push(
      `${label}: lives in \`${dirLang}/\` which is not one of the site languages (${LANGS.join(", ")})`,
    )
  }
  if (segments.length > 2 && !SECTIONS.includes(dirSection)) {
    problems.push(
      `${label}: section directory \`${dirSection}\` is not one of ${SECTIONS.join(", ")}`,
    )
  }

  if (data.lang !== undefined) {
    if (!LANGS.includes(data.lang)) {
      problems.push(`${label}: lang \`${data.lang}\` is not one of ${LANGS.join(", ")}`)
    } else if (LANGS.includes(dirLang) && data.lang !== dirLang) {
      // A `lang: en` file sitting in `ko/` would get the wrong <html lang>,
      // the wrong hreflang, and would pair with the wrong counterpart.
      problems.push(
        `${label}: frontmatter says \`lang: ${data.lang}\` but the file is in \`${dirLang}/\` — these must agree`,
      )
    }
  }

  if (data.publish !== undefined && typeof data.publish !== "boolean") {
    problems.push(
      `${label}: \`publish\` must be a boolean (true/false), got ${JSON.stringify(data.publish)}`,
    )
  }

  if (data.translationKey !== undefined && typeof data.translationKey !== "string") {
    problems.push(`${label}: \`translationKey\` must be a string`)
  }

  if (data.date !== undefined && !DATE_RE.test(String(data.date))) {
    problems.push(`${label}: \`date\` must be YYYY-MM-DD, got ${JSON.stringify(data.date)}`)
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    problems.push(`${label}: \`tags\` must be a list`)
  }

  return problems
}

/** Read + parse every Markdown file under Public/. Throws on the first malformed one. */
export async function readPublicNotes({ requirePublish = false } = {}) {
  const files = (await walk(VAULT_PUBLIC)).filter((f) => f.endsWith(".md"))
  const notes = []
  for (const rel of files) {
    const abs = path.join(VAULT_PUBLIC, rel)
    await assertInside(VAULT_PUBLIC, abs, "note escapes the Public tree")
    const raw = await fs.readFile(abs, "utf8")
    const { data, body } = parseFrontmatter(raw, rel)
    if (requirePublish && data.publish !== true) continue
    notes.push({ rel, abs, data, body, raw })
  }
  return notes
}
