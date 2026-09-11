# cmun2.github.io

Bilingual (Korean / English) technical blog. [Quartz 4](https://quartz.jzhao.xyz),
static, deployed free to GitHub Pages.

Written by [Chang Yong Mun](https://github.com/cmun2), frontend engineer at AhnLab.

**Visual design has not been done.** This is Quartz's stock theme on purpose —
structure, plumbing and the KO/EN machinery first, appearance later.

---

## Quick start

```bash
pnpm install          # pnpm 10.5.2, Node 22+
pnpm blog:publish     # validate → guard → sync → guard → links → build
pnpm blog:preview     # sync, then serve on http://localhost:8080 with live reload
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

Two worked examples, both rewrites of Korean posts, both with a matching
`translationKey`:

- `en/engineering/hydration-mismatch-was-not-the-bug.md`
  ← `ko/engineering/ssr-hydration-node-mismatch.md`
- `en/engineering/why-i-kept-setinterval.md`
  ← `ko/engineering/requestanimationframe-vs-setinterval.md`

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

---

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
  migrate-inblog.mjs        one-shot migration
  inblog-map.mjs            curated slug/section/tag table for the 40 posts
quartz.config.ts            baseUrl, plugins
quartz.layout.ts            where the switcher and head are wired in
```

`BilingualHead` _appends_ to Quartz's stock `Head` via `cloneElement` rather than
forking it, so pulling upstream Quartz changes does not silently drop new meta
tags. The only edits to upstream Quartz files are one guard in
`quartz/plugins/emitters/contentPage.tsx` (suppressing the "missing index.md"
warning, since the root is a redirect here) and the two export lines in
`components/index.ts` and `plugins/emitters/index.ts`.
