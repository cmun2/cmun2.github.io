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
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
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
      Plugin.CustomOgImages(),
      // Emits public/index.html redirecting to /${DEFAULT_LANG}/.
      // Must come last so it wins over anything else claiming the root slug.
      Plugin.LanguageRootRedirect(),
    ],
  },
}

export default config
