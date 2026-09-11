/**
 * Bilingual site wiring — shared by the LanguageSwitcher component, the
 * hreflang/canonical head, and the root-language redirect emitter.
 *
 * Everything language-related that is a *decision* rather than a mechanism
 * lives in this file, so there is exactly one place to change it.
 */

import { QuartzPluginData } from "./plugins/vfile"
import { FullSlug, joinSegments } from "./util/path"

/** Languages this site publishes. Order is the order shown in the switcher. */
export const SITE_LANGS = ["ko", "en"] as const
export type SiteLang = (typeof SITE_LANGS)[number]

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEFAULT_LANG — the single knob that decides what `https://cmun2.github.io/`
 * shows. The root emits a redirect to `/${DEFAULT_LANG}/`, and `x-default`
 * hreflang points at the same language.
 *
 * It is "ko" because every post is currently Korean and the English tree is
 * nearly empty; sending visitors to `/en/` today would land them on a stub.
 *
 * TO FLIP THE SITE TO ENGLISH-FIRST: change this one line to "en" and rebuild.
 * Nothing else needs to change. Do it once the English side has enough posts
 * to be worth a recruiter's first click.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const DEFAULT_LANG: SiteLang = "ko"

/** Human-readable labels for the KO | EN switcher. */
export const LANG_LABELS: Record<SiteLang, string> = {
  ko: "KO",
  en: "EN",
}

/** `<html lang>` / hreflang values. Kept separate in case they ever diverge. */
export const LANG_HREFLANG: Record<SiteLang, string> = {
  ko: "ko",
  en: "en",
}

export function isSiteLang(x: unknown): x is SiteLang {
  return typeof x === "string" && (SITE_LANGS as readonly string[]).includes(x)
}

/**
 * The language a page belongs to. Frontmatter `lang` is authoritative; the
 * directory is the fallback so that Quartz-generated pages (folder listings,
 * tag pages) still land in the right language bucket.
 */
export function langOf(data: Pick<QuartzPluginData, "slug" | "frontmatter">): SiteLang | undefined {
  const fromFrontmatter = data.frontmatter?.lang
  if (isSiteLang(fromFrontmatter)) return fromFrontmatter

  const first = (data.slug ?? "").split("/")[0]
  if (isSiteLang(first)) return first

  return undefined
}

/** The stable id that pairs a KO page with its EN counterpart. */
export function translationKeyOf(data: Pick<QuartzPluginData, "frontmatter">): string | undefined {
  const key = data.frontmatter?.translationKey
  return typeof key === "string" && key.length > 0 ? key : undefined
}

export type TranslationSet = Partial<Record<SiteLang, QuartzPluginData>>

/**
 * Find every language version of `fileData`, including `fileData` itself.
 *
 * Pairing is by `translationKey` and nothing else — not by filename, not by
 * path — so a Korean post and its English rewrite can have completely
 * different slugs, which they should, because a good English title is not a
 * transliteration of the Korean one.
 *
 * A page with no `translationKey` is its own only version. That is the common
 * case right now and is treated as normal, not as an error.
 */
export function findTranslations(
  fileData: Pick<QuartzPluginData, "slug" | "frontmatter">,
  allFiles: QuartzPluginData[],
): TranslationSet {
  const out: TranslationSet = {}

  const ownLang = langOf(fileData)
  if (ownLang) out[ownLang] = fileData as QuartzPluginData

  const key = translationKeyOf(fileData)
  if (!key) return out

  for (const other of allFiles) {
    if (translationKeyOf(other) !== key) continue
    const otherLang = langOf(other)
    if (!otherLang) continue
    // Never let another file shadow the page we are actually rendering.
    if (otherLang === ownLang) continue
    out[otherLang] = other
  }

  return out
}

/** Absolute `https://host/path` URL for a slug, used for hreflang + canonical. */
export function absoluteUrl(baseUrl: string | undefined, slug: FullSlug): string {
  const base = new URL(`https://${baseUrl ?? "example.com"}`)
  // Quartz slugs end in `index` for directory pages; trim it so the canonical
  // URL is the directory URL a browser would actually show.
  const cleaned = slug === "index" ? "" : slug.replace(/(^|\/)index$/, "$1")
  return joinSegments(base.toString(), cleaned)
}
