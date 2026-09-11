/**
 * Curated mapping for the one-shot inblog.io migration.
 *
 * Why a hand-written table rather than deriving everything from the source URL:
 *
 *  - inblog slugs are percent-encoded Korean plus a numeric id
 *    (`.../네트워크-요청sse-52576`). Deriving filenames from them would give the
 *    new site URLs like `/ko/engineering/%EB%84%A4%ED%8A%B8...`, which is bad
 *    for a career-facing blog and worse for anyone pasting a link.
 *  - `translationKey` has to survive the Korean post being renamed and the
 *    English rewrite getting a completely different title, so it is an ASCII
 *    slug chosen once, here, and never derived from a filename again.
 *
 * `id` is the numeric inblog post id — the one genuinely stable identifier the
 * source gave us, kept in frontmatter as `sourceId` so a re-run can match.
 *
 * `section` is a judgement call. The rule applied: a post that teaches how
 * something works or walks through building something goes to `engineering`;
 * a post you would look something up in goes to `notes`.
 */

export const POSTS = [
  // ── Korean ────────────────────────────────────────────────────────────────
  {
    id: "52592",
    lang: "ko",
    section: "notes",
    slug: "git-commands",
    key: "git-commands",
    tags: ["git"],
  },
  {
    id: "52731",
    lang: "ko",
    section: "engineering",
    slug: "jest-test-setup-1",
    key: "jest-test-setup-1",
    tags: ["jest", "testing"],
  },
  {
    id: "52736",
    lang: "ko",
    section: "engineering",
    slug: "jest-test-setup-2",
    key: "jest-test-setup-2",
    tags: ["jest", "testing"],
  },
  {
    id: "53237",
    lang: "ko",
    section: "engineering",
    slug: "micro-frontend-module-federation",
    key: "micro-frontend-module-federation",
    tags: ["micro-frontend", "module-federation"],
  },
  {
    id: "53239",
    lang: "ko",
    section: "engineering",
    slug: "webpack5-module-federation",
    key: "webpack5-module-federation",
    tags: ["micro-frontend", "module-federation", "webpack"],
  },
  {
    id: "53240",
    lang: "ko",
    section: "engineering",
    slug: "msa-demo-project",
    key: "msa-demo-project",
    tags: ["micro-frontend", "module-federation"],
  },
  {
    id: "53241",
    lang: "ko",
    section: "engineering",
    slug: "monolith-vs-micro-frontend",
    key: "monolith-vs-micro-frontend",
    tags: ["micro-frontend", "architecture"],
  },
  {
    id: "53242",
    lang: "ko",
    section: "engineering",
    slug: "micro-application-integration",
    key: "micro-application-integration",
    tags: ["micro-frontend", "architecture"],
  },
  {
    id: "52740",
    lang: "ko",
    section: "engineering",
    slug: "web-app-bridge-communication",
    key: "web-app-bridge-communication",
    tags: ["webview", "javascript"],
  },
  {
    id: "52737",
    lang: "ko",
    section: "engineering",
    slug: "storybook-testing",
    key: "storybook-testing",
    tags: ["storybook", "testing"],
  },
  {
    id: "52738",
    lang: "ko",
    section: "engineering",
    slug: "bitbucket-jenkins-cicd",
    key: "bitbucket-jenkins-cicd",
    tags: ["cicd", "jenkins"],
  },
  {
    id: "52729",
    lang: "ko",
    section: "engineering",
    slug: "jest-environment-setup",
    key: "jest-environment-setup",
    tags: ["jest", "testing"],
  },
  {
    id: "52727",
    lang: "ko",
    section: "engineering",
    slug: "pinia-global-state",
    key: "pinia-global-state",
    tags: ["pinia", "vue", "state-management"],
  },
  {
    id: "52387",
    lang: "ko",
    section: "engineering",
    slug: "nuxt-3-deep-dive-1",
    key: "nuxt-3-deep-dive-1",
    tags: ["nuxt", "vue", "ssr"],
  },
  {
    id: "52549",
    lang: "ko",
    section: "notes",
    slug: "http-errors",
    key: "http-errors",
    tags: ["http"],
  },
  {
    id: "52596",
    lang: "ko",
    section: "engineering",
    slug: "i18n-missing-key-error",
    key: "i18n-missing-key-error",
    tags: ["i18n"],
  },
  {
    id: "52399",
    lang: "ko",
    section: "engineering",
    slug: "firebase-phone-authorization",
    key: "firebase-phone-authorization",
    tags: ["firebase", "auth"],
  },
  {
    id: "52551",
    lang: "ko",
    section: "engineering",
    slug: "ssr-hydration-node-mismatch",
    key: "ssr-hydration-node-mismatch",
    tags: ["nuxt", "ssr", "hydration"],
  },
  {
    id: "52711",
    lang: "ko",
    section: "engineering",
    slug: "global-error-page-ssr-typescript",
    key: "global-error-page-ssr-typescript",
    tags: ["nuxt", "ssr", "typescript"],
  },
  {
    id: "52739",
    lang: "ko",
    section: "engineering",
    slug: "web-vs-webview-resource-loading",
    key: "web-vs-webview-resource-loading",
    tags: ["webview", "performance"],
  },
  {
    id: "52745",
    lang: "ko",
    section: "notes",
    slug: "typescript-route-query-inference",
    key: "typescript-route-query-inference",
    tags: ["typescript"],
  },
  {
    id: "52543",
    lang: "ko",
    section: "notes",
    slug: "tsconfig-json-fields",
    key: "tsconfig-json-fields",
    tags: ["typescript"],
  },
  {
    id: "52544",
    lang: "ko",
    section: "notes",
    slug: "switch-vs-if-else",
    key: "switch-vs-if-else",
    tags: ["javascript"],
  },
  {
    id: "52744",
    lang: "ko",
    section: "engineering",
    slug: "typescript-infer",
    key: "typescript-infer",
    tags: ["typescript"],
  },
  {
    id: "52654",
    lang: "ko",
    section: "engineering",
    slug: "build-deploy-slack-cicd",
    key: "build-deploy-slack-cicd",
    tags: ["cicd", "slack"],
  },
  {
    id: "52435",
    lang: "ko",
    section: "engineering",
    slug: "mapped-type-string-literal",
    key: "mapped-type-string-literal",
    tags: ["typescript"],
  },
  {
    id: "52546",
    lang: "ko",
    section: "notes",
    slug: "iso-8601",
    key: "iso-8601",
    tags: ["iso", "date"],
  },
  {
    id: "52568",
    lang: "ko",
    section: "engineering",
    slug: "network-long-polling",
    key: "network-long-polling",
    tags: ["javascript", "networking"],
  },
  {
    id: "52575",
    lang: "ko",
    section: "engineering",
    slug: "network-websocket",
    key: "network-websocket",
    tags: ["javascript", "networking"],
  },
  {
    id: "52576",
    lang: "ko",
    section: "engineering",
    slug: "network-sse",
    key: "network-sse",
    tags: ["javascript", "networking"],
  },
  {
    id: "52545",
    lang: "ko",
    section: "notes",
    slug: "private-class-field",
    key: "private-class-field",
    tags: ["javascript"],
  },
  {
    id: "52361",
    lang: "ko",
    section: "engineering",
    slug: "nuxt-3-deep-dive-2",
    key: "nuxt-3-deep-dive-2",
    tags: ["nuxt", "vue", "ssr"],
  },
  {
    id: "52712",
    lang: "ko",
    section: "engineering",
    slug: "requestanimationframe-vs-setinterval",
    key: "requestanimationframe-vs-setinterval",
    tags: ["javascript", "performance"],
  },
  {
    id: "52894",
    lang: "ko",
    section: "notes",
    slug: "nextjs-stale-changes-not-reflected",
    key: "nextjs-stale-changes-not-reflected",
    tags: ["nextjs"],
  },

  // ── Already written in English on inblog. These go straight to Public/en/ ──
  // They have no Korean counterpart, so their `translationKey` pairs with
  // nothing — the switcher will correctly show KO as unavailable.
  {
    id: "272066",
    lang: "en",
    section: "engineering",
    slug: "module-federation-in-production",
    key: "module-federation-in-production",
    tags: ["micro-frontend", "module-federation"],
  },
  {
    id: "272256",
    lang: "en",
    section: "engineering",
    slug: "streaming-to-the-browser-sse",
    key: "streaming-to-the-browser-sse",
    tags: ["javascript", "networking"],
  },
  {
    id: "272259",
    lang: "en",
    section: "engineering",
    slug: "llm-in-the-code-review-loop",
    key: "llm-in-the-code-review-loop",
    tags: ["cicd", "llm"],
  },
  {
    id: "278745",
    lang: "en",
    section: "engineering",
    slug: "mcp-schemas-617-servers",
    key: "mcp-schemas-617-servers",
    tags: ["typescript", "mcp"],
  },
]

export const BY_ID = new Map(POSTS.map((p) => [p.id, p]))
