# cmun2.github.io

Bilingual (Korean / English) technical blog. [Quartz 4](https://quartz.jzhao.xyz),
static, deployed free to GitHub Pages.

Written by [Chang Yong Mun](https://github.com/cmun2), frontend engineer at AhnLab.

The site is skinned in **SIGNAL / SYSTEM**, the same design system as the
portfolio at `~/Projects/portfolio/changyong-portfolio` — see
[Visual design](#visual-design) below.

---

## Quick start

```bash
pnpm install          # pnpm 10.5.2, Node 22+
pnpm blog:publish     # validate → guard → sync → guard → links → build
pnpm blog:preview     # sync, then serve on http://localhost:8080 with live reload

pnpm blog:test-guard  # plant six leak scenarios, assert all six are refused
pnpm blog:test-lang   # assert the KO/EN machinery in the built public/ tree
```

> **Use `pnpm`, not `npm`.** Quartz pins `npm >= 10.9.2` in `engines` with
> `engine-strict=true`, and this machine has npm 10.9.0, so `npx quartz build`
> refuses to run. pnpm does not enforce the `npm` engine field and works fine.
> `.npmrc` sets `node-linker=hoisted` so pnpm lays out `node_modules` the way
> Quartz expects.

Build output goes to `public/` (gitignored). The dev server is
`pnpm quartz build --serve`.

---

## How writing works

Posts are written in **Obsidian**, in the vault at
`~/Documents/Obsidian Vault`. Nothing is written in this repo directly.

```
Obsidian Vault/
├── 00-inbox/       ┐
├── 10-projects/    │
├── 20-career/      │  private. the sync script cannot see these.
├── 30-knowledge/   │  it does not filter them out — it never reads them.
├── 40-results/     │
├── 50-lessons/     │
├── 90-archive/     ┘
└── Public/         ← the only directory the blog can read
    ├── ko/
    │   ├── index.md
    │   ├── engineering/   ← deep dives: architecture, debugging, performance
    │   ├── notes/         ← short reference notes
    │   ├── projects/
    │   └── retrospectives/
    └── en/
        └── (same four sections)
```

To publish: write a note in `Public/<lang>/<section>/`, give it the frontmatter
below, run `pnpm blog:publish`, commit, push.

### Frontmatter contract

Every note under `Public/` must have all of these. The validator rejects the file
by name if any is missing or wrong.

```yaml
---
title: 네트워크 요청(SSE)
lang: ko # ko | en — must match the directory the file is in
translationKey: network-sse # stable id; identical across the KO/EN pair
publish: true # must be a real boolean
date: 2024-08-16 # YYYY-MM-DD
tags: [javascript, networking]
---
```

Optional: `description`, `modified`, and the provenance fields the migration
wrote (`sourceUrl`, `sourceId`, `sourceCategory`).

`translationKey` is the _only_ thing that pairs a Korean post with its English
one. Filenames are free to differ, and should — a good English title is not a
transliteration of the Korean one. The two posts in
`en/engineering/` that have Korean counterparts use completely different slugs.

---

## The private-note guard

This is the part of the repo that matters most. A private note reaching a public
GitHub repo is permanent, and this is a security company's employee's blog.

**Two independent gates. Both must hold.**

| Gate             | Check                                                                  | Enforced by                                                 |
| ---------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| **1 — location** | the file's _real_ path, symlinks resolved, is inside `Public/`         | `scripts/check-private-paths.mjs`, `scripts/sync-vault.mjs` |
| **2 — intent**   | frontmatter says `publish: true` — not truthy, not absent, the boolean | same                                                        |

They are independent on purpose. Dragging a private note into `Public/` by
accident does not publish it. Setting `publish: true` on a note in `20-career/`
does not publish it either. Both mistakes must happen at once.

The guard also checks that nothing was hand-placed into `content/`, that no
symlink escapes `Public/`, and that no private vault path appears as a string
anywhere in `content/`. Any violation exits non-zero and names the file.

### Verify it yourself

```bash
pnpm blog:test-guard
```

This plants real leak scenarios — including a symlink from `Public/ko/notes/`
to a genuinely private file in `20-career/` — runs the real pipeline against
them, asserts every one is refused, and cleans up. Run it after touching
anything under `scripts/`.

---

## The pipeline

`pnpm blog:publish` runs these in order, stopping at the first failure:

| Step            | Script                    | What it refuses                                                                                                                                                   |
| --------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blog:validate` | `validate-content.mjs`    | missing/malformed frontmatter, bad `lang`, `lang` disagreeing with its directory, non-boolean `publish`, bad date, duplicate `translationKey` within one language |
| `blog:guard`    | `check-private-paths.mjs` | anything failing either gate above                                                                                                                                |
| `blog:sync`     | `sync-vault.mjs`          | copying from outside `Public/`. Mirrors rather than appends — flipping `publish: false` deletes the copy in `content/`                                            |
| `blog:guard`    | (again)                   | anything that landed in `content/` unexpectedly                                                                                                                   |
| `blog:links`    | `check-links.mjs`         | broken relative links, missing images, unresolvable `[[wikilinks]]`                                                                                               |
| `blog:build`    | Quartz                    | —                                                                                                                                                                 |

The guard runs twice — before the copy so nothing bad reaches `content/`, and
after so nothing unexpected is sitting there.

`content/` is **generated but committed**, because the GitHub Actions runner has
no access to the vault and builds from the committed tree. Never edit `content/`
by hand; the guard will reject it.

---

## English is a rewrite, not a translation

Machine-translated English reads worse than no English. The English side is a
**rewrite for a different reader** — someone who does not need the Korean
context, does not want the lifecycle table, and wants the reasoning.

Workflow:

1. **Write in Korean.** Full detail, whatever the post needs.
2. **Decide whether it is worth an English version.** Most posts are not.
   Reference notes almost never are. Posts with a decision, a mistake, or a
   non-obvious conclusion are.
3. **Rewrite in English.** New title, new structure, new slug. Same
   `translationKey`. Cut the parts that only made sense in the original context;
   add the framing an outside reader needs. Say what you were wrong about.
4. **Read it aloud.** If a sentence sounds like it was translated, it was.
5. **Publish.** The switcher and hreflang pick it up automatically the moment
   the counterpart exists — nothing to register anywhere.

Three worked examples, all rewrites of Korean posts, all with a matching
`translationKey`:

- `en/engineering/hydration-mismatch-was-not-the-bug.md`
  ← `ko/engineering/ssr-hydration-node-mismatch.md`
- `en/engineering/why-i-kept-setinterval.md`
  ← `ko/engineering/requestanimationframe-vs-setinterval.md`
- `en/engineering/one-vault-two-gates.md`
  ← `ko/engineering/publishing-from-a-private-vault.md`

Four posts in `en/` were written in English originally and have no Korean
counterpart. That is fine — the switcher shows KO greyed out.

---

## Languages and the root URL

- `quartz/i18nSite.ts` holds `DEFAULT_LANG`. It is `"ko"`.
  `https://cmun2.github.io/` emits a redirect to `/ko/`, and `x-default`
  hreflang points there.
- **To flip the site to English-first, change that one line to `"en"` and
  rebuild.** Nothing else needs to change. Do it once the English side has
  enough posts to be worth a recruiter's first click — right now `/en/` is
  nearly empty and defaulting to it would land visitors on stubs.
- `LanguageSwitcher` renders `KO | EN`. It resolves the counterpart by
  `translationKey` and links to its real URL. When there is no counterpart —
  the common case — it renders a greyed-out, `aria-disabled` span, **never a
  link that 404s**.

### Per-page chrome

Upstream Quartz has exactly one `locale` — it assumes a single-language site.
That made `/en/` render 검색 / 탐색기 / 목차 and `2026년 9월 11일`.

The fix is one value, not a fork. `quartz/i18nSite.ts` maps each language onto a
Quartz locale (`ko` → `ko-KR`, `en` → `en-US`), and `renderPage` swaps it into
the configuration object **before** any component runs, from the same `langOf()`
that decides `<html lang>` and the hreflang set. Every Quartz component already
reads its strings and its date format from `cfg.locale` on the props it is
handed, so search, explorer, table of contents, graph, backlinks, the theme and
reader toggles, reading time and dates all follow the page — without a single
component being copied into this repo.

Two strings are built outside any component and needed their own line: the
generated folder title, and the social card. Both are in the table above.

**Deliberately still in the site language:** `/tags/…` and `404.html`. They sit
outside `/ko/` and `/en/` on purpose — a tag page lists posts in both languages,
so it has no language of its own, and for the same reason it carries no switcher
and no hreflang. `blog:test-lang` checks them for the absence of all three.

**Not reachable at all:** a handful of upstream strings are hardcoded English
rather than translated, and are English on Korean pages too — the `<title>` inside
the search icon, `aria-label="Global Graph"`, and the breadcrumb root `Home`.
Fixing them means either forking three components or patching upstream's i18n
tables; neither is worth the upgrade cost for three labels, and leaving them is
coherent because they are English everywhere rather than English in one tree.

### SEO

- Self-referencing `<link rel="canonical">` on every page.
- `<link rel="alternate" hreflang="…">` for every language version _including
  the page's own_ (Google requires the set to be self-inclusive and mutually
  referencing), plus `x-default`.
- `<html lang>` from frontmatter `lang`.
- `public/sitemap.xml` — all pages, absolute URLs from `baseUrl`.
- `public/index.xml` — RSS, 10 most recent.

Both are emitted by Quartz's `ContentIndex` plugin and land at the root of the
built site, i.e. `https://cmun2.github.io/sitemap.xml` and
`https://cmun2.github.io/index.xml`.

Every claim in this section is checked against the built tree rather than
trusted:

```bash
pnpm blog:build && pnpm blog:test-lang
```

`scripts/check-bilingual.mjs` walks `public/` and asserts that each page is
self-canonical; that each hreflang set includes the page's own language, names
every counterpart, is referenced back by each counterpart, and carries an
`x-default`; that `<html lang>` agrees with the language tree the page sits in;
and that the switcher either links to a file that exists in the right language
and links back, or renders a disabled, non-anchor span. Tag pages and the 404
are checked for the opposite — a canonical, and deliberately no switcher and no
hreflang.

It also asserts the chrome is in the page's own language, in both directions. It
reads each string out of the one slot that renders it — the search button and its
placeholder, the explorer and table-of-contents headings, the graph and backlinks
headings, the theme and reader toggles, the generated folder title, the date in
the content meta — and compares it against that component's string in _both_
locales, so Korean chrome on `/en/` and English chrome on `/ko/` each fail by
name. Reading slots rather than grepping the page is what makes that possible: a
Korean post about search engines contains the word "Search" in its prose, and
Quartz hardcodes English labels outside its i18n tables, so no whole-page
vocabulary scan could tell chrome from content. As a net for chrome this file
does not yet know about, an `/en/` page's left sidebar must contain no Hangul at
all — nothing there is page content, because the explorer tree is built in the
browser.

---

## Visual design

The blog and the portfolio are skinned from one design system, **SIGNAL /
SYSTEM**, so that someone who opens both sees one person. The source of the
system is `changyong-portfolio/docs/design-system.md`; nothing here is a second
identity.

The vocabulary: warm graphite ground, warm off-white ink, editorial hairline
rules, small operational labels in monospace (dates, breadcrumbs, tags, the
language switcher), and three signal accents — cyan, green, amber — used only
at small scale. Never as a large fill.

**Where the tokens live — two files, one palette.**

|                             |                                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quartz.config.ts`          | Quartz's nine colour slots (`--light` … `--textHighlight`) plus the typography. Quartz's OG-image renderer reads the palette from here, which is why it cannot move. |
| `quartz/styles/custom.scss` | Everything the portfolio has and Quartz does not: `--bg-raised`, `--bg-inset`, `--rule-strong`, the signal accents, `--steel`, `--sand` — plus the whole skin.       |

Change them together. Both files say so.

Light is **derived, not inverted**: warm paper keeping the same ink / rule /
accent relationships the graphite ground has, with each accent darkened until
it clears contrast on paper. Measured, on both grounds: body text ≥ 7:1,
headings ≥ 14:1, metadata ≥ 7:1, every accent used as text ≥ 4.5:1. The table
is in the header comment of `custom.scss`.

Nothing communicates state by colour alone. The unavailable half of the
language switcher is struck through as well as dimmed, the current one is
underlined as well as bold, prose links are underlined rather than merely
coloured, and the diagram legends name every treatment they use.

Typography is Space Grotesk and IBM Plex Mono, the portfolio's families. Korean
falls through to the OS stack (Apple SD Gothic Neo / Noto Sans KR) rather than
shipping a multi-megabyte Hangul webfont to a Korean-first blog. `:lang(ko)`
gets `word-break: keep-all`. The occasional serif aside uses a system serif for
the same reason — the portfolio's Newsreader is first in the stack if it is
ever worth loading.

`quartz/static/icon.png` is the portfolio's CM signal mark, rendered from its
`icon.svg`. The mark also appears next to the site title, as two theme-specific
data URIs in `custom.scss`.

### Diagrams

`diagrams/` holds two self-contained HTML files — no build step, no Mermaid —
and the `<svg>` fragment each one is built from:

|                   |                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `publish-path`    | the vault, the two gates, the mirror, the site                                                                   |
| `retrieval-layer` | notes and session logs → chunking → local embedding → the index → CLI and MCP, inside a boundary nothing crosses |

The same fragments are inlined into the KO and EN copies of _One vault, two
gates_. They are drawn against `--dg-*` custom properties, which the standalone
files define as literals and `custom.scss` maps onto the site's theme
variables — so in the post they follow the theme **toggle**, not just the OS
preference, and a palette change moves the page and the diagrams together.

To regenerate the standalone wrappers after editing a fragment, the wrapper is
plain HTML; edit it directly or re-paste the fragment between the `<figure>`
tags.

## Getting it live on GitHub Pages

Nothing has been pushed. The repo is local and has no remote. The GitHub Actions
workflow in `.github/workflows/deploy.yaml` does nothing until one exists.

**The repo must be named exactly `cmun2.github.io`** — that is what makes it a
GitHub Pages _user site_ served at `https://cmun2.github.io/`, which is what
`baseUrl` is set to. Any other name serves from a subpath and every absolute URL
in the sitemap and hreflang tags will be wrong.

```bash
cd ~/Projects/open-source/cmun2.github.io

git add -A
git commit -m "Bilingual Quartz blog: 40 migrated posts, KO/EN plumbing, publish guard"

# Create the repo on GitHub — public, no README, no .gitignore, no license.
# Either through the web UI at https://github.com/new (name it cmun2.github.io)
# or, if the gh CLI is authenticated:
#   gh repo create cmun2.github.io --public --source=. --remote=origin

git branch -M main
git remote add origin git@github.com:cmun2/cmun2.github.io.git
git push -u origin main
```

Then, once:

1. GitHub → the repo → **Settings → Pages**
2. **Source: GitHub Actions** (not "Deploy from a branch")
3. Push to `main`, or run the workflow manually from the Actions tab.

The site appears at `https://cmun2.github.io/` a minute or two later.

### Later: a custom domain

`changyong.dev` was available and deliberately not bought. When that changes:

1. `quartz.config.ts` → `baseUrl: "changyong.dev"`
2. add `Plugin.CNAME()` to the emitters list
3. point DNS at GitHub Pages and set the domain in Settings → Pages

Nothing else in the repo hardcodes the host.

---

## Where things came from

40 posts were migrated once from `cmun2.inblog.io` by
`scripts/migrate-inblog.mjs`. It is a **one-shot script, not a scraper**: it runs
by hand, sequentially, 1.5 s between requests, against the author's own public
blog, and there is no scheduled job anywhere in this repo. Every post keeps
`sourceUrl` and `sourceId` in its frontmatter.

Fetched HTML is cached in `.migration-cache/` (gitignored, ~4 MB) so the script
can be re-run without touching the network:

```bash
node scripts/migrate-inblog.mjs --dry-run --no-fetch
```

165 images were downloaded alongside and live next to the posts in
`images/<post-slug>/`. That is ~50 MB in `content/` — well inside GitHub's
limits, but it is why the repo is not small. If it ever becomes a problem the
answer is to re-encode the screenshots, not to move them off-repo.

---

## Layout of this repo

```
content/                    generated by blog:sync — never edit by hand
quartz/
  i18nSite.ts               DEFAULT_LANG, language list, translationKey pairing
  components/
    LanguageSwitcher.tsx    KO | EN, disabled when no counterpart
    BilingualHead.tsx       stock Head + canonical + hreflang
  plugins/emitters/
    languageRootRedirect.ts / → /ko/
scripts/
  lib/blog.mjs              shared paths, frontmatter parsing, path assertions
  validate-content.mjs      frontmatter contract
  check-private-paths.mjs   the two gates
  sync-vault.mjs            Public/ → content/, mirroring
  check-links.mjs           broken links and images
  test-guard.mjs            adversarial test of the guard
  check-bilingual.mjs       post-build test of canonical / hreflang / switcher
  migrate-inblog.mjs        one-shot migration
  inblog-map.mjs            curated slug/section/tag table for the 40 posts
diagrams/                   standalone HTML diagrams + the SVG fragments
                            inlined into the posts
quartz.config.ts            baseUrl, plugins, palette, typography
quartz.layout.ts            where the switcher and head are wired in
quartz/styles/custom.scss   the SIGNAL / SYSTEM skin and its tokens
```

`BilingualHead` _appends_ to Quartz's stock `Head` via `cloneElement` rather than
forking it, so pulling upstream Quartz changes does not silently drop new meta
tags. The edits to upstream Quartz files are deliberately few, and this is all
of them:

| File                                               | Edit                                                                                                        | Why                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugins/emitters/contentPage.tsx`                 | one guard                                                                                                   | suppresses the "missing index.md" warning; the root is a redirect here                                                                                                                                                                                                                                                                                                                                            |
| `components/index.ts`, `plugins/emitters/index.ts` | two export lines                                                                                            | `LanguageSwitcher` / `BilingualHead` / `LanguageRootRedirect`                                                                                                                                                                                                                                                                                                                                                     |
| `components/renderPage.tsx`                        | `<html lang>` uses `langOf()`, and the page's own locale is swapped into `cfg` before any component renders | Quartz generates folder pages (`/en/engineering/`) with no frontmatter, so they inherited the site locale and shipped `<html lang="ko">` while their own hreflang and switcher said `en`. The same `langOf()` now also decides `cfg.locale`, which is where every component reads its UI strings and date format from — one field threaded through, no component forked. See [Per-page chrome](#per-page-chrome). |
| `plugins/emitters/folderPage.tsx`                  | folder title uses the folder's own language                                                                 | A generated folder page's title (`Folder: en/engineering`) is invented in the emitter before any component exists, so the locale `renderPage` threads through cannot reach it. `/en/engineering/` said `폴더:`.                                                                                                                                                                                                   |
| `plugins/emitters/ogImage.tsx`                     | social card uses the page's language                                                                        | The card is the one place this site is seen out of its own context, and an English post's card carried a Korean date. One line: the same `localizedCfg()` call.                                                                                                                                                                                                                                                   |
| `styles/custom.scss`, `static/icon.png`            | the skin and the favicon                                                                                    | see [Visual design](#visual-design)                                                                                                                                                                                                                                                                                                                                                                               |
