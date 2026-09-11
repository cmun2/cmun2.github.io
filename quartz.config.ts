import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { DEFAULT_LANG } from "./quartz/i18nSite"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Chang Yong Mun",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    // No analytics: it would mean a third-party account and a cookie banner.
    // Set to { provider: "goatcounter", websiteId: "..." } later if wanted.
    analytics: null,
    // Only affects Quartz's own UI strings and date formatting. Per-page
    // language comes from frontmatter `lang` (see quartz/i18nSite.ts).
    locale: DEFAULT_LANG === "ko" ? "ko-KR" : "en-US",

    // ── Hosting ────────────────────────────────────────────────────────────
    // GitHub Pages user site: the repo must be named `cmun2.github.io`.
    // Host only — no protocol, no trailing slash.
    baseUrl: "cmun2.github.io",
    //
    // TO MOVE TO A CUSTOM DOMAIN LATER (e.g. changyong.dev), this is the change:
    //   1. baseUrl: "changyong.dev"
    //   2. add Plugin.CNAME() to the emitters list below
    //   3. point the domain's DNS at GitHub Pages and set it in repo Settings
    // Nothing else in the repo hardcodes the host.
    // ───────────────────────────────────────────────────────────────────────

    ignorePatterns: ["private", "templates", ".obsidian"],
    // Show the original publication date from frontmatter `date`, not the git
    // mtime — migrated posts were all committed on the same day.
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      // SIGNAL / SYSTEM typography, same families as the portfolio:
      // Space Grotesk for everything set in sans, IBM Plex Mono for the
      // "system register" — labels, dates, code. Korean falls through to the
      // OS stack (Apple SD Gothic Neo / Noto Sans KR); shipping a multi-MB
      // Hangul webfont for a Korean-first blog is not worth the bytes.
      typography: {
        header: { name: "Space Grotesk", weights: [400, 500, 700] },
        // Space Grotesk ships no italic on Google Fonts; asking for one
        // makes the request longer and gets silently dropped. Editorial
        // italic is the serif aside in custom.scss instead.
        body: { name: "Space Grotesk", weights: [400, 500, 700], includeItalic: false },
        code: "IBM Plex Mono",
      },
      // ── SIGNAL / SYSTEM palette ──────────────────────────────────────────
      // Lifted from the portfolio's design system (docs/design-system.md in
      // changyong-portfolio) so the blog and the portfolio read as one person.
      //
      // Quartz only has nine slots. The rest of the system — bg-raised,
      // bg-inset, rule-strong, and the three signal accents — lives in
      // quartz/styles/custom.scss. CHANGE BOTH TOGETHER.
      //
      // Measured contrast on each ground (WCAG 2.1, see the table in
      // custom.scss): body text ≥ 7:1, every accent used as text ≥ 4.5:1.
      // Nothing in this theme communicates state by colour alone.
      colors: {
        // Light is *derived*, not inverted: warm paper keeping the same
        // ink/rule/accent relationships the dark ground has.
        lightMode: {
          light: "#f6f2ea", // warm paper ground
          lightgray: "#e2dbcd", // hairline rules, inline-code ground
          gray: "#554e42", // metadata, dates            7.36:1
          darkgray: "#26221d", // body text                 14.15:1
          dark: "#14110d", // headings, strong          16.86:1
          secondary: "#0e6d76", // links — cyan darkened      5.42:1
          tertiary: "#8a5a13", // hover — amber darkened     5.29:1
          highlight: "rgba(14, 109, 118, 0.08)",
          textHighlight: "rgba(224, 164, 88, 0.45)",
        },
        // Dark is the portfolio's own graphite ground, unchanged.
        darkMode: {
          light: "#161412", // --bg        warm graphite
          lightgray: "#332e28", // --rule
          gray: "#a89f93", // --ink-muted                7.04:1
          darkgray: "#ece7df", // --ink                     14.93:1
          dark: "#f2ede5", // --ink lifted              15.77:1
          secondary: "#4fd6e0", // --signal-cyan             10.52:1
          tertiary: "#e0a458", // --signal-amber             8.42:1
          highlight: "rgba(79, 214, 224, 0.10)",
          textHighlight: "rgba(224, 164, 88, 0.32)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      // Latex is deliberately OFF. On a frontend blog `$` is Vue's `$route`,
      // jQuery, a shell prompt or a template literal far more often than it is
      // math, and KaTeX turns the text between two of them into a parse
      // warning and mangled output. Re-enable with Plugin.Latex({ renderEngine:
      // "katex" }) if a post ever actually needs equations.
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      // Emits public/sitemap.xml and public/index.xml (RSS), both built from
      // the `baseUrl` above.
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Dark palette: the portfolio is dark-first, and a social card is the
      // one place this site gets seen out of its own context.
      Plugin.CustomOgImages({ colorScheme: "darkMode" }),
      // Emits public/index.html redirecting to /${DEFAULT_LANG}/.
      // Must come last so it wins over anything else claiming the root slug.
      Plugin.LanguageRootRedirect(),
    ],
  },
}

export default config
