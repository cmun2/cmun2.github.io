---
title: Chang Yong Mun
lang: en
translationKey: home
publish: true
date: 2026-09-08
tags: [about]
description: Frontend engineer at a security company. Leading a React migration, building AI investigation interfaces over SSE, and the platform underneath them.
---

Frontend engineer at [AhnLab](https://www.ahnlab.com), a security company in Seoul.

I lead the Vue/Nuxt-to-React migration of a core product. React and TypeScript are
the present tense; Vue/Nuxt is where most of the older posts on this site came from.

Alongside it:

- **Real-time AI investigation interfaces** — an agent's event stream arrives over
  SSE and has to look coherent to an analyst before it has finished. AI Triage and
  AI Investigation sit on top of it.
- **Independently deployable modules** over Module Federation, delivered through
  containers, Harbor, Jenkins, Helm and Kubernetes.
- **A shared frontend library** on an internal npm registry — components, design
  tokens, hooks, utilities — co-maintained with another team and used by three
  product teams.
- A Monaco-based editing experience for a security-policy DSL, and an enterprise
  authentication migration: OTP plus the access- and refresh-token lifecycle.
- The product's one bidirectional operator session — socket lifetime, liveness,
  reconnection, designed with no in-house precedent. I contributed to it; I did
  not own it.

Turning the migration into a repeatable agent-assisted system raised completed
throughput by more than 75%.

## Outside work

Small fixes to libraries I use, each one starting from a reproduction.

- Merged — [openai/openai-node #2512](https://github.com/openai/openai-node/pull/2512),
  [huggingface/hf-mcp-server #238](https://github.com/huggingface/hf-mcp-server/pull/238)
- Open — [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript/pull/1163),
  [anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python/pull/1877),
  [claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript/pull/451),
  [openai-agents-js](https://github.com/openai/openai-agents-js/pull/1763)
- An [accepted answer on a zod discussion](https://github.com/colinhacks/zod/discussions/5936)

## Writing

What I write about tends to be whatever turned out to be harder than the
documentation implied, including the approaches that did not work and why.

- [Engineering](engineering/) — the longer pieces: architecture, debugging, performance

Most posts are written in Korean first. The English side is a rewrite rather than a
translation, so it is shorter and it lags behind. If a post shows **EN** in grey at
the top, the English version does not exist yet.

`notes/`, `projects/` and `retrospectives/` are empty on the English side for now.
They are linked from here once they have something in them.

## Elsewhere

- GitHub: [@cmun2](https://github.com/cmun2)
- Previous blog: [cmun2.inblog.io](https://cmun2.inblog.io) (being migrated here)
