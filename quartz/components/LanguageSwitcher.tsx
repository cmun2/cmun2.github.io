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
/* SIGNAL / SYSTEM: the switcher is an operational label, not navigation
   chrome — mono, tracked, uppercase, sitting on the header hairline. */
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--codeFont);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.14em;
}

.language-switcher-sep {
  color: var(--lightgray);
  user-select: none;
}

.language-switcher-item {
  text-decoration: none;
  color: var(--gray);
  padding: 0.2rem 0.1rem;
}

/* The page you are on. Marked by an underline as well as by weight and
   colour, so the state survives a monochrome rendering. */
.language-switcher-item.current {
  color: var(--dark);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 0 var(--secondary);
}

/* The common case: no counterpart exists. Struck through rather than merely
   dimmed — "there is no English version" must not be a colour-only claim. */
.language-switcher-item.unavailable {
  color: var(--gray);
  opacity: 0.55;
  cursor: not-allowed;
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

a.language-switcher-item:hover {
  color: var(--secondary);
}
`

  return LanguageSwitcher
}) satisfies QuartzComponentConstructor<Partial<Options>>

// Re-exported for callers that want to know what the root of the site resolves to.
export { DEFAULT_LANG }
