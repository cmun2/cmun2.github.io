import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative } from "../util/path"
import {
  DEFAULT_LANG,
  LANG_LABELS,
  SITE_LANGS,
  findTranslations,
  langOf,
  type SiteLang,
} from "../i18nSite"

interface Options {
  /**
   * Show the switcher on pages that have no counterpart at all.
   * `true` (the default) keeps the header stable across the site and makes it
   * visible that an English version is simply not written yet.
   */
  showWhenAlone: boolean
}

const defaultOptions: Options = {
  showWhenAlone: true,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const LanguageSwitcher: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentLang = langOf(fileData)

    // Pages outside the language tree (404, tag index, …) get no switcher.
    if (!currentLang) return null

    const translations = findTranslations(fileData, allFiles)
    const availableCount = SITE_LANGS.filter((l) => translations[l] !== undefined).length
    if (availableCount <= 1 && !opts.showWhenAlone) return null

    return (
      <div class={classNames(displayClass, "language-switcher")} role="group" aria-label="Language">
        {SITE_LANGS.map((lang: SiteLang, i) => {
          const label = LANG_LABELS[lang]
          const isCurrent = lang === currentLang
          const counterpart = translations[lang]

          const separator = i > 0 ? <span class="language-switcher-sep">|</span> : null

          if (isCurrent) {
            return (
              <>
                {separator}
                <span class="language-switcher-item current" aria-current="page" lang={lang}>
                  {label}
                </span>
              </>
            )
          }

          // The important case: most posts are Korean-only, so there is usually
          // nothing to link to. Render a disabled span — never a link that 404s.
          if (!counterpart?.slug) {
            return (
              <>
                {separator}
                <span
                  class="language-switcher-item unavailable"
                  lang={lang}
                  aria-disabled="true"
                  title={
                    lang === "en"
                      ? "No English version of this page yet"
                      : "No Korean version of this page yet"
                  }
                >
                  {label}
                </span>
              </>
            )
          }

          return (
            <>
              {separator}
              <a
                class="language-switcher-item"
                href={resolveRelative(fileData.slug!, counterpart.slug)}
                lang={lang}
                hrefLang={lang}
                data-no-popover={true}
              >
                {label}
              </a>
            </>
          )
        })}
      </div>
    )
  }

  LanguageSwitcher.css = `
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-family: var(--headerFont);
  letter-spacing: 0.04em;
}

.language-switcher-sep {
  color: var(--lightgray);
  user-select: none;
}

.language-switcher-item {
  text-decoration: none;
  color: var(--gray);
}

.language-switcher-item.current {
  color: var(--darkgray);
  font-weight: 700;
}

.language-switcher-item.unavailable {
  color: var(--lightgray);
  cursor: not-allowed;
}

a.language-switcher-item:hover {
  color: var(--secondary);
}
`

  return LanguageSwitcher
}) satisfies QuartzComponentConstructor<Partial<Options>>

// Re-exported for callers that want to know what the root of the site resolves to.
export { DEFAULT_LANG }
