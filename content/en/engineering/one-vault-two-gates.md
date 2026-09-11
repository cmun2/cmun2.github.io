---
title: One vault, two gates, and a reason that did not survive
lang: en
translationKey: publishing-from-one-vault
publish: true
date: 2026-09-11
tags: [obsidian, quartz, vector-search, local-first]
description: A blog, a private Obsidian vault and a local semantic index, built under one constraint — with the alternatives I rejected, the numbers that settled the rest, and one argument that turned out not to be an argument.
---

> This is the English version of a Korean post. It is a rewrite rather than a translation: the Korean original spends longer on the publishing pipeline because that is what I had to build first. This one is more about the reasoning, including the part I got wrong.

I work at a security company. The notes I take during the day live in the same Obsidian vault as my salary material, my career notes, and the drafts of these posts. One vault.

That is the entire constraint, and nearly everything else on this page follows from it. A private note that reaches a public repository is permanent — you do not un-publish it, you only add a commit on top of it. So the interesting question was never "which static site generator". It was "what is the shape of the thing that stands between the vault and the internet".

## The obvious fix, and why I did not take it

Split the vault. One for things that can be public, one for things that cannot. Plenty of people work this way and I started there.

It fails on the same thing every time: you end up **managing the same knowledge twice**. A note I take while debugging is a work note on Monday and a blog post four months later. With two vaults that transition is a move, and after the move I have to remember which copy is current. Rules that depend on me remembering are rules that eventually break.

The second candidate was git branches — write on a private branch, merge the publishable parts to a public one. That is worse. **A branch is version control, not an access boundary.** One careless commit and the note is in history, and getting it out of history is unpleasant work that you do under time pressure, after it is already pushed.

So the vault stays whole, and the enforcement moves to the way out.

## Two gates, and the fact that they are independent

A file is published only if both of these hold.

**Location.** Its *real* path — symlinks resolved first — is inside `Public/`. A symlink sitting in `Public/` that points at my career notes is refused, not followed. The rest of the vault is not filtered out of the copy; it is never read in the first place.

**Intent.** Its frontmatter says `publish: true`. Not truthy, the boolean. A file with no `publish` field at all is refused rather than defaulted, because **absence is not consent** — "it had no `publish` field so we assumed false" is one refactor away from "it had no `publish` field so we assumed true".

The independence is the part that matters. Dragging a private note into `Public/` by accident does not publish it. Setting `publish: true` on a note outside `Public/` does not publish it either. Both mistakes have to happen at once.

<figure class="diagram">
<svg viewBox="0 0 1080 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="publish-path-title publish-path-desc">
<title id="publish-path-title">The publish path and its two gates</title>
<desc id="publish-path-desc">Architecture diagram of a blog publishing pipeline. One Obsidian vault holds a private tree and a Public directory; only the Public directory feeds a location gate and an intent gate, both of which must hold, before the sync mirrors the file into the repository and the site is built. Each gate has a refused path that stops before the next stage.</desc>
<defs>
<marker id="pp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
<marker id="pp-arrow-muted" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-muted)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<rect x="32" y="88" width="208" height="256" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="72" y="92" width="128" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="136" y="101" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">ONE VAULT · LOCAL</text>
<rect x="688" y="212" width="360" height="132" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="800" y="216" width="136" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="868" y="225" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">PUBLIC · GITHUB</text>
<line x1="224" y1="276" x2="296" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="464" y1="276" x2="504" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="672" y1="276" x2="704" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="848" y1="276" x2="880" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<path d="M 380,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="362" y1="352" x2="398" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<path d="M 588,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="570" y1="352" x2="606" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="236" y="252" width="48" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="260" y="261" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">42 NOTES</text>
<rect x="352" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="380" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="560" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="588" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="130" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="82" y="139" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">PRIVATE</text>
<text x="136" y="162" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Private tree</text>
<text x="136" y="178" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">no path leaves this box</text>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="60" y="250" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SOURCE</text>
<text x="136" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Public/</text>
<text x="136" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">ko/ · en/</text>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="308" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="330" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 1</text>
<text x="380" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Location</text>
<text x="380" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">realpath inside Public/</text>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="516" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="538" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 2</text>
<text x="588" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Intent</text>
<text x="588" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">publish: true</text>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="716" y="250" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="738" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">MIRROR</text>
<text x="776" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">content/</text>
<text x="776" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">unpublish deletes</text>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="892" y="250" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="910" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SITE</text>
<text x="956" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Static build</text>
<text x="956" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">Quartz · Pages</text>
<line x1="32" y1="408" x2="1048" y2="408" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="424" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="440" width="14" height="10" rx="2" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<text x="52" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Gate — both must hold, independently</text>
<rect x="340" y="440" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Directory the pipeline reads or writes</text>
<line x1="648" y1="446" x2="676" y2="446" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<text x="684" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Permitted path</text>
<line x1="808" y1="440" x2="808" y2="450" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="800" y1="452" x2="816" y2="452" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="828" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Refused — stops at the gate</text>
</svg>
<figcaption>Gate 1 resolves symlinks before deciding, so a link pointing out of <code>Public/</code> is refused rather than followed. Gate 2 refuses a missing <code>publish</code> field instead of defaulting it. The sync mirrors rather than appends, so flipping <code>publish</code> back to <code>false</code> deletes the copy that already went out.</figcaption>
</figure>

The sync mirrors rather than appends, for the same reason. Set `publish: false` and the next run deletes the published copy. Un-publishing being a no-op is the worst possible behaviour for this particular repository.

All of that is still only a claim. To turn it into a check I planted six leak scenarios and ran the real pipeline against them: a genuine symlink from `Public/` into the folder that holds my career notes, a note with no `publish` field, frontmatter that does not parse, a file hand-placed into the published tree without going through the sync, a `lang` that disagrees with the directory it sits in, two notes claiming the same translation key. All six are refused, and the test puts the vault back the way it found it. `pnpm blog:test-guard` re-runs it whenever I have touched anything nearby.

Quartz falls out of the same constraint. The vault is already the source of truth, so the site should **render** it rather than hold a second copy of it. One place where writing lives means one direction of sync, and one direction of sync means one place to put the gates.

## The reason that did not survive

The second half of this started when the vault got big enough that I could no longer find things in it. Around a hundred notes is the point where "where did I write that down" becomes a real cost — not because full-text search fails, but because what I remember is the situation, not the words I used.

In August I wrote the decision down before writing any code. The conclusion at the time was *not yet*, and next to it I wrote the two conditions that would reverse it:

- semantic questions come up at least weekly
- **AI session logs**, not just notes, become something I want to search

Both fired, so I built it. The value of writing the conditions down first is that months later you can tell the difference between needing a thing and wanting to build it. Without them I would have built it in August.

That same note gave two reasons for choosing Milvus Lite over Chroma. Having now written the code, one of them is not a reason.

The dead one: *Chroma effectively needs a server if you are calling it from TypeScript.* True as a sentence, and useless as a comparison — Milvus Lite is Python-only too. From TypeScript neither is embedded; from Python both are. I had applied the same constraint to one candidate and not the other and written the result down as a difference.

The surviving one is **API continuity**. Lite, Standalone and Distributed are the same client API. Everything that touches the database sits in one file, and the only Lite-specific lines in it are the constructor that takes a local path and the call that releases the server on close. When the index outgrows a laptop, that URI becomes `localhost:19530` and the schema, filters, upserts and searches are unchanged. What does *not* carry over is the index type: `AUTOINDEX` resolves to a brute-force scan in Lite, which is the right answer for ten thousand chunks and the wrong one for a million.

If the decision had been clean I would not have written this section. It is here because the conclusion held while half its justification did not, and deleting the bad half is how you make the same mistake again.

## The model was measured, not picked

This is where the time actually went.

Rather than choosing on reputation or a public leaderboard, I scored six candidates **against my own vault**: a 28-query gold set built by hand from real notes, run identically for each model. The gold set deliberately mixes three regimes — Korean question against a Korean note, Korean question against an English note, and English question against a Korean note.

| model | R@5 | MRR@10 | on disk |
|---|---|---|---|
| **dragonkue/snowflake-arctic-embed-l-v2.0-ko** | **0.964** | **0.946** | 2.29 GB |
| BAAI/bge-m3 | 0.964 | 0.923 | 4.56 GB |
| jhgan/ko-sroberta-multitask *(Korean-only control)* | 0.929 | 0.857 | 0.44 GB |

`bge-m3` ties on recall and costs twice the disk. That one is easy.

The Korean-only control is the interesting row. 0.929 / 0.857 is not a bad result. It is five times smaller and seven times faster, and since the vault is mostly Korean it beat the multilingual models a tier down. What disqualified it was not the total — it was **one direction**. Asked an English question whose answer is a Korean note, it ranked an unrelated English post above the right one.

My vault is Korean prose with English technical terms embedded in it, and I ask in both languages. Close to half the indexed notes are posts from this blog, some of them written in English. So that direction is not a nice-to-have, and a single failure in it is the entire argument for paying for a multilingual model in disk and in CPU seconds.

## Nothing leaves the machine, and I checked three ways

<figure class="diagram">
<svg viewBox="0 0 1080 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="retrieval-layer-title retrieval-layer-desc">
<title id="retrieval-layer-title">The retrieval layer, end to end on one machine</title>
<desc id="retrieval-layer-desc">Architecture diagram of a local semantic index. Vault notes and AI session transcripts are chunked, embedded by a model running on the laptop's CPU, and written to a single Milvus Lite file, which a command-line search and an MCP server read. A dashed path leaving the embedding step for a hosted API stops at the machine boundary; the only sockets opened are loopback.</desc>
<defs>
<marker id="rl-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<text x="540" y="96" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">hosted embedding API · model hub · telemetry</text>
<rect x="32" y="112" width="1016" height="232" rx="8" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="4,4"/>
<rect x="48" y="106" width="228" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="52" y="115" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" letter-spacing="0.14em">THIS MACHINE · 0 NON-LOOPBACK SOCKETS</text>
<path d="M 200,176 H 212 Q 220,176 220,184 V 208 Q 220,216 228,216 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 200,280 H 228 Q 236,280 236,272 V 248 Q 236,240 244,240 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="408" y1="228" x2="456" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="624" y1="228" x2="672" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,216 H 856 Q 864,216 864,208 V 184 Q 864,176 872,176 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,240 H 864 Q 872,240 872,248 V 272 Q 872,280 880,280 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 540,196 V 132" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="522" y1="128" x2="558" y2="128" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="568" y="134" width="64" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="600" y="143" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NO EGRESS</text>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="152" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NOTES</text>
<text x="124" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Vault notes</text>
<text x="124" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">97 markdown files</text>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="78" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">LOGS</text>
<text x="124" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Session logs</text>
<text x="124" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">129 transcripts</text>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="268" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="286" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="332" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Chunking</text>
<text x="332" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">heading-aware</text>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="468" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="486" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="540" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Embedding</text>
<text x="540" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">on-disk model · CPU</text>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="684" y="204" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="704" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STORE</text>
<text x="760" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Milvus Lite</text>
<text x="760" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">local store · grpc 127.0.0.1</text>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="152" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">kb search</text>
<text x="960" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">command line</text>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">MCP server</text>
<text x="960" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">stdio · no port</text>
<line x1="32" y1="376" x2="1048" y2="376" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="392" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="404" width="14" height="10" rx="2" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="3,2"/>
<text x="52" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">The machine — nothing crosses this line</text>
<rect x="340" y="404" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Step or store</text>
<line x1="504" y1="410" x2="532" y2="410" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<text x="540" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Local data path</text>
<line x1="700" y1="404" x2="700" y2="414" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="692" y1="416" x2="708" y2="416" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="720" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Egress that does not happen</text>
</svg>
<figcaption>226 documents — 97 notes and 129 session transcripts — and 10,659 chunks. The only sockets the process opens are the loopback pair between the client and the engine running inside it. A cold build takes 39 minutes; a reindex with nothing changed takes two seconds, because the model is never loaded.</figcaption>
</figure>

A hosted embedding API was never a candidate. Given what the vault holds, that decision makes itself. Embedding runs on the laptop's CPU, the model is read from a local cache, the index is local, and there is no call out to a language model to summarise results — the retrieval layer assembles context, prints it, and stops.

The trouble with local-only as a claim is that saying it costs nothing. So:

1. **A socket trap.** `connect`, `connect_ex`, `create_connection` and `getaddrinfo` are patched to raise on any non-loopback address, and then a real index and a real query run with the real model. Anything reaching for the network fails the test and names the host it wanted. It lives in the test suite, so it keeps running.
2. **`lsof` during a live search.** Non-loopback sockets opened: zero. The ones that do appear are the client and the in-process engine talking to each other over `127.0.0.1`.
3. **The Wi-Fi switched off.** Interface down, `curl` confirmed failing, then index, search and status all run to completion.

The third one is the blunt instrument and also the convincing one.

## The line I wrote down and then had to honour

The August note contains this:

> The vector DB is a regenerable index, not the source.

Obvious when I wrote it. Less obvious after sitting through a 39-minute cold build, at which point deleting the index starts to feel expensive — and the moment it feels expensive, you are treating it as the source.

So it became a test: delete the index, rebuild it, assert that the same queries return the same top hits. I also did it for real on the whole thing — three queries, top five each, and all fifteen hits came back identical, same paths, same scores to three decimal places.

The index is now something I can throw away. The truth is the Markdown and the JSONL. A principle you write down is a nice sentence until something in the repository enforces it.

## What this adds up to

- Refusing to split the vault decided most of the rest. Two gates instead of one, a site that renders rather than copies, and search that never leaves the laptop all follow from that single choice.
- Where there was a default available, I took the refusal instead. No frontmatter means no, and un-publishing deletes.
- The embedding model came from my own data, not a leaderboard, and the deciding evidence was one failure direction rather than an average.
- One of the two reasons behind a decision was wrong and the decision was still right. That is in the post on purpose.

A single hard constraint makes design easier, not harder. There is simply less to choose from.
