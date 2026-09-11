import { FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { DEFAULT_LANG } from "../../i18nSite"

/**
 * Emits `public/index.html` as a redirect to `/${DEFAULT_LANG}/`.
 *
 * The site has no bilingual landing page on purpose: a splash screen asking
 * "KO or EN?" is a click tax on every visitor. Instead the root sends everyone
 * to the default language and the KO|EN switcher in the header handles the
 * rest.
 *
 * The language is decided by DEFAULT_LANG in `quartz/i18nSite.ts` — one line.
 *
 * Uses a meta refresh + canonical rather than an HTTP redirect because GitHub
 * Pages serves static files only and cannot issue a 301.
 */
export const LanguageRootRedirect: QuartzEmitterPlugin = () => ({
  name: "LanguageRootRedirect",
  async *emit(ctx) {
    const target = `${DEFAULT_LANG}/`
    const canonical = `https://${ctx.cfg.configuration.baseUrl ?? "example.com"}/${target}`

    yield write({
      ctx,
      slug: "index" as FullSlug,
      ext: ".html",
      content: `<!DOCTYPE html>
<html lang="${DEFAULT_LANG}">
<head>
<meta charset="utf-8">
<title>${ctx.cfg.configuration.pageTitle}</title>
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=./${target}">
</head>
<body>
<p>Redirecting to <a href="./${target}">${canonical}</a>…</p>
</body>
</html>
`,
    })
  },
  async *partialEmit() {},
})
