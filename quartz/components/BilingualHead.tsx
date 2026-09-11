import { cloneElement, toChildArray } from "preact"
import BaseHead from "./Head"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import {
  DEFAULT_LANG,
  LANG_HREFLANG,
  SITE_LANGS,
  absoluteUrl,
  findTranslations,
  langOf,
  type SiteLang,
} from "../i18nSite"

/**
 * Quartz's stock <head>, plus the SEO plumbing a bilingual site needs.
 *
 * Implemented by *appending* to the upstream Head rather than forking it, so
 * `git merge upstream/v4` keeps working when Quartz changes its meta tags.
 *
 * Adds:
 *   - <link rel="canonical">      self-referencing, absolute, on every page
 *   - <link rel="alternate" hreflang="ko|en">  for every language version
 *     INCLUDING the page's own language. Google requires the set to be
 *     self-inclusive and mutually referencing; omitting the self entry is the
 *     single most common way hreflang silently does nothing.
 *   - <link rel="alternate" hreflang="x-default"> pointing at DEFAULT_LANG
 *
 * Pages with no counterpart get a canonical and a single self hreflang. That
 * is correct: it says "this page exists in one language", not "this page is
 * broken".
 */
const Base = BaseHead()

const BilingualHead: QuartzComponent = (props: QuartzComponentProps) => {
  const head = Base(props) as preact.VNode<any>
  const { fileData, allFiles, cfg } = props

  const slug = fileData.slug!
  const canonical = absoluteUrl(cfg.baseUrl, slug)

  const extra: preact.VNode[] = [<link key="canonical" rel="canonical" href={canonical} />]

  const currentLang = langOf(fileData)
  if (currentLang) {
    const translations = findTranslations(fileData, allFiles)

    for (const lang of SITE_LANGS as readonly SiteLang[]) {
      const page = translations[lang]
      if (!page?.slug) continue
      extra.push(
        <link
          key={`alt-${lang}`}
          rel="alternate"
          hrefLang={LANG_HREFLANG[lang]}
          href={absoluteUrl(cfg.baseUrl, page.slug)}
        />,
      )
    }

    // x-default = what a visitor with no matching language preference should
    // see. Falls back to whatever version exists if the default one does not.
    const xDefaultPage =
      translations[DEFAULT_LANG] ?? SITE_LANGS.map((l) => translations[l]).find((p) => p?.slug)
    if (xDefaultPage?.slug) {
      extra.push(
        <link
          key="alt-x-default"
          rel="alternate"
          hrefLang="x-default"
          href={absoluteUrl(cfg.baseUrl, xDefaultPage.slug)}
        />,
      )
    }

    // og:locale is cheap and helps social unfurls pick the right language.
    extra.push(<meta key="og-locale" property="og:locale" content={currentLang} />)
  }

  return cloneElement(head, {}, [...toChildArray(head.props.children), ...extra])
}

export default (() => BilingualHead) satisfies QuartzComponentConstructor
