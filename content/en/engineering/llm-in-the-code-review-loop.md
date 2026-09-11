---
title: "An LLM in the Code Review Loop: The Parts That Aren't the Model"
lang: en
translationKey: llm-in-the-code-review-loop
publish: true
date: 2026-08-10
modified: 2026-08-23
tags: [cicd, llm]
description: We cut review turnaround by about 60% by putting a model between Bitbucket and the team. Comment budgets, idempotency, and never blocking a merge mattered more…
sourceUrl: https://cmun2.inblog.io/272259
sourceId: 272259
sourceCategory: CI/CD
---

We cut our review turnaround by roughly 60% by putting an LLM between Bitbucket and the team. Very little of that work was prompt engineering.

The prompt took an afternoon. Everything that decided whether the team kept the thing switched on took considerably longer.

### The problem was latency, not quality

Our pull requests were not getting bad reviews. They were getting late ones. A PR opened on Friday afternoon got its first comment Monday morning.

The cost of that gap is not the review itself — it is the context switch. By Monday the author has moved on, and re-loading a change you wrote three days ago is most of the work of fixing it.

So the metric I targeted was **median time from PR open to first substantive comment**. Not "find more bugs." That distinction shaped every decision that followed.

### Why an orchestrator instead of a service

I built the pipeline in n8n rather than writing a bot service. Three reasons:

- **The pipeline changes weekly in its first month.** A redeploy per tweak kills the iteration speed you need while you are still learning what a good comment looks like.

- **Every run is inspectable.** When the bot posts something stupid, you can open that specific execution and see the exact payload that produced it. Reproducing a bad LLM output from application logs is miserable by comparison.

- **Credentials, retries, and backoff already exist.** None of that is interesting to write again.

The tradeoff is real: a workflow living in a tool's database is not source-controlled. Export the workflow JSON into the repo and treat it like code, or you will eventually lose it.

### The shape

```
Bitbucket PR webhook
  → filter    (skip drafts, bots, oversized changesets)
  → fetch diff
  → assemble context
  → LLM
  → rank + cap
  → post inline comments
```

Deterministic edges, model in the middle. The model is the only component allowed to be non-deterministic, and it is wrapped on both sides by code that is not.

### The four decisions that mattered

**1. Review the diff, not the files.**

The first version sent whole changed files. Two problems. Context blew up on large files, and the model commented on code that had not been touched. Those comments were often correct and completely unwelcome — nobody opens a PR to be told about a function they did not write. Sending a unified diff with a few lines of surrounding context fixed both at once.

**2. Cap the comments.**

Ask a model to review 300 lines and it will find thirty things. Thirty comments is not a review, it is a wall, and a wall gets muted.

Have the model emit a severity with each finding, sort, take the top five inline. Everything else goes into one collapsed summary comment. Adoption turned out to be a function of signal density, not of coverage.

**3. Make re-runs idempotent.**

Force-pushes are normal. Without a dedupe key, every push re-posts the same comments, and by the third round the PR is unreadable.

```
key = hash(file, anchor_line_content, rule_id)
```

Anchor on the line's _content_, not its number — line numbers shift when anything above them changes, and a positional key will happily re-post everything after a one-line insertion at the top of the file.

**4. Never gate the merge.**

Advisory only. The first false positive that blocks a release is the last day anyone leaves the integration enabled. A tool like this earns its place by being useful, not by being mandatory — and if it is genuinely useful, it does not need to be mandatory.

### What "60%" actually measures

Median time to first substantive comment. It is not 60% fewer bugs, and it is not 60% less human review.

Humans still review everything. What changed is where they start. The bot handles the mechanical pass — an unhandled error path, an inconsistent name, a null check that went missing during a refactor — so the human reviewer opens the PR already past that layer and spends their attention on design.

Worth stating plainly, because "we automated code review" usually describes something considerably smaller than it sounds.

### The same pattern, pointed at documentation

The second automation came out of the same idea: architecture documentation that nobody had time to keep current.

The useful realization was that the model does not need to _infer_ our architectural conventions. It needs to be _handed_ them. So our internal patterns became reusable Skills — versioned instruction bundles the model loads on demand — rather than a prompt someone pastes and slowly mutates.

Then the output format decision, which mattered more than the generation:

> Generate [draw.io](http://draw.io) XML, not an image.

A generated PNG is a dead end. When one box is wrong — and one box is always wrong — nobody can fix it, so the diagram is regenerated or abandoned. [draw.io](http://draw.io) XML opens in an editor the team already has:

```xml
<mxCell id="gw" value="API Gateway" style="rounded=1" vertex="1" parent="1">
  <mxGeometry x="40" y="40" width="160" height="60" as="geometry"/>
</mxCell>
```

The generated diagram becomes a starting point a human finishes in two minutes, instead of an artifact they either accept or throw away.

### The rule underneath both

Deterministic edges, model in the middle, and an output a human can correct without starting over.

In both systems the model is the least interesting component — and that is what made them survive contact with a team.
