---
title: "I Was Wrong About MCP Schemas — Here's What 617 Servers Actually Show"
lang: en
translationKey: mcp-schemas-617-servers
publish: true
date: 2026-08-28
modified: 2026-08-28
tags: [typescript, mcp]
description: I pre-registered a hypothesis that a fifth of public MCP servers break strict clients. Then I measured 617 servers and 14,804 tools. The answer was zero — and…
sourceUrl: https://cmun2.inblog.io/278745
sourceId: 278745
sourceCategory: Typescript
---

I had a theory worth testing: a meaningful share of public MCP servers ship tool schemas that a spec-following client rejects outright, and because one bad tool kills the whole `tools/list` response, those servers appear to have _no tools at all_.

I wrote the hypothesis down before collecting anything — **at least 20% of servers fully rejected**, with a pre-committed rule that under 5% meant abandon it. Then I started 617 public MCP servers from npm and PyPI, captured their real `tools/list` responses, and ran the resulting 14,804 tool schemas through actual production validators.

**The answer was 0.0%.** Not a low number. Zero servers out of 617.

That is the least interesting sentence in this post. What I found while being wrong is the rest of it.

### Why the hypothesis was wrong

The failure mode is real. In the official MCP TypeScript SDK the list response is parsed as:

```ts
const ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: z.array(ToolSchema),
})
```

`z.array()` fails the entire array if a single element fails. One malformed `inputSchema` and `client.listTools()` throws — the server now has zero usable tools. The amplifier exists exactly as I described it.

Nothing pulls the lever, for a reason I should have predicted:

**Almost nobody writes these schemas by hand.** npm servers overwhelmingly use the official TypeScript SDK, which _generates_ `inputSchema` from a zod type. PyPI servers use FastMCP, which generates from pydantic. A human never types `"type": "object"`, so violating it is not so much rare as unexpressible. The bug reports I had built the hypothesis on came from hand-written Go schemas — and Go servers ship as OCI images, which my environment couldn't start. That gap is the honest limit of this measurement, and I'll come back to it.

The second reason: OpenAI's Agents SDK has `convert_schemas_to_strict` defaulting to `False`, and even when you turn it on, a failed conversion degrades _that one tool_ to non-strict instead of failing the server.

The scary mechanism was already defended upstream, by people who hit it before me.

### Making sure 0% wasn't a broken detector

A zero is the easiest number to get by accident. Three checks:

**The verdict wasn't mine.** I did not judge conformance with my own rules. The headline number comes from the official SDK's real parser, `ListToolsResultSchema.safeParse()` — the same code path a production client runs.

**A positive control.** I injected ten known-bad schemas pulled from real bug reports — bare `true`, missing `type`, `type: ["object","null"]`, `required: null`, a `"string"` root. The oracle threw on 7/7 of the ones that should fail and passed 3/3 of the ones that shouldn't.

That control also caught a genuine bug in _my_ linter: an `is not None` guard was silently skipping `required: null`. If I had trusted my own rules, I would have shipped a detector with a hole in it and never known.

**A holdout.** A separate slice collected _after_ the rules were frozen agreed: 0.0%.

The zero is real.

### What the same corpus actually shows

Conformance to the MCP spec was never the problem. The problem is what happens when a client takes a spec-valid `inputSchema` and hands it straight to a provider's strict mode.

| Axis                                          | Servers   | Tools |
| --------------------------------------------- | --------- | ----- |
| MCP spec conformance (whole-server rejection) | **0.0%**  | 0.0%  |
| OpenAI strict — hard conversion failure       | 27.6%     | 5.9%  |
| OpenAI strict — **silent** constraint loss    | 56.9%     | 22.5% |
| Anthropic `strict: true` subset violation     | **63.0%** | 23.0% |
| Anthropic request complexity limits           | 37.3%     | —     |

To be precise about what these are not: **none of this means the servers are broken.** Every one of them is valid MCP. These are the rates at which a naive client, passing `inputSchema` through unmodified, would get a 400.

Then the result I did not expect:

| Subset                          | Anthropic strict violation |
| ------------------------------- | -------------------------- |
| All servers                     | 63.0%                      |
| GitHub stars ≥ 10               | 59.8%                      |
| Tools ≥ 5                       | 66.4%                      |
| **npm weekly downloads ≥ 1000** | **85.0%**                  |

**The more a server is actually used, the more it violates.** This is not spam inflating the base rate — filtering to serious servers pushes the number _up_. The mechanism is mundane once you see it: a real tool has a richly described schema, and a rich schema carries more constraint keywords, and constraint keywords are exactly what strict subsets drop.

The most-violated keywords are not exotic. They are `minimum`, `maximum`, `minLength`, `maxLength` — the ordinary vocabulary of describing a parameter well.

### The failure mode I'd actually worry about

Hard rejection is loud. You get a 400, you fix it.

**56.9% of servers have constraints that are silently discarded.** You write `minLength: 1`, the strict subset doesn't support it, and the constraint simply stops existing. No error, no warning. Your schema says one thing and the model is handed another.

The tool still works. It just stops enforcing what you thought you had specified — and you find out through a malformed argument in production rather than a validation error at development time.

### And sometimes you can't even express it

Some of these aren't violations to be fixed. They're representational limits.

`z.record(z.string(), z.string())` — an open dictionary, say a map of arbitrary HTTP headers — generates `additionalProperties: {"type": "string"}`. To satisfy strict mode you need `additionalProperties: false` and an exhaustive `properties` list. For arbitrary headers that means enumerating every header name in advance.

That is not a three-line fix. That is deleting the feature. The correct place to fix it was never the server; it was the client's downgrade path, and that already exists upstream.

### One thing genuinely broken

While cross-checking the Anthropic axis against the official Python SDK, `transform_schema` raised:

```
AssertionError: Expected code to be unreachable, but got: ['string', 'null']
```

`type` as an array is valid JSON Schema, and it is the default output of `z.string().nullable()` and `Optional[str]` — so it arrives constantly rather than exceptionally. It failed locally, before any request, with an assertion rather than a validation error.

What made it clearly a bug rather than an unsupported edge: the strict-tool-use documentation's own complexity-limits table explicitly budgets for this shape — _"parameters that use&#x20;_`anyOf`_&#x20;or type arrays (for example,&#x20;_`"type": ["string", "null"]`_)"_. A shape with its own line in the limits table should not be unrepresentable in the transform.

Reported with a self-contained reproduction — no API key, no network, since the failure happens in local normalisation — along with a proposed fix. Cross-checking the TypeScript SDK surfaced a separate transform bug in the same layer, where `$defs` is dropped when a schema root is a `$ref`. Both are open as I write this.

### What I'd tell you

**Writing a server:** you are almost certainly spec-conformant, and you should not contort your schemas to satisfy any one provider's strict subset. But know that your `minimum` and `minLength` may not survive the trip.

**Writing a client:** the downgrade path is the whole product. Don't pass `inputSchema` through unmodified, and when you drop a constraint, say so somewhere a developer will see it.

### What I couldn't measure

Go servers ship as OCI images and I had no container runtime — so the one population where schemas _are_ hand-written, which is where my original hypothesis came from, is missing. If the 0% is wrong anywhere, it is there.

The corpus is public: 617 servers, 14,804 tool schemas, CC BY 4.0. The checker is MIT. If you think a number here is wrong, the data to prove it is in the repository.

---

[_mcp-schema-census_](https://github.com/cmun2/mcp-schema-census)_&#x20;— point it at your MCP server and see which provider strict modes reject your tool schemas, and why._
