---
title: "Module Federation in Production: What Actually Changed"
lang: en
translationKey: module-federation-in-production
publish: true
date: 2026-06-15
modified: 2026-08-24
tags: [micro-frontend, module-federation]
description: Independent deployment sounds good on a slide. Here is what Module Federation cost us, what it bought, and the three things that broke first. | MSA
sourceUrl: https://cmun2.inblog.io/272066
sourceId: 272066
sourceCategory: MSA
---

Micro frontends get sold as an org chart solution: let each team ship on its own schedule. That part is true. What nobody puts on the slide is that you trade a build-time problem for a runtime one, and runtime problems are harder to see.

This is what I learned running Module Federation in a security product where modules genuinely had to deploy on separate cycles.

### The problem that justified it

A monolithic frontend has one release train. Every team waits for the slowest one. When a product has modules with genuinely different release rhythms — one shipping weekly, another gated behind a security review — that coupling is the actual cost, not the build time.

Module Federation is worth it when **independent deployment is a requirement, not a preference.** If your teams are happy shipping together, you are buying complexity you will not use.

### Choosing an integration strategy

There are four ways to compose independently built apps, and they fail differently.

| Approach                | How it works                                                            | Where it hurts                                                                  |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Server-side composition | Nginx requests HTML from each server, one server assembles the response | Infra-heavy; every team needs a server                                          |
| Build-time integration  | Each module publishes an npm package; the container depends on them     | Independent _build_, not independent _deploy_ — you still rebuild the container |
| iframe                  | Load each app in a frame                                                | Simple and isolated, but SEO, routing, and styling all become fights            |
| Runtime integration     | Load remote bundles over the network and mount them                     | Real independent deploy — and a real runtime failure surface                    |

Build-time integration is the one people reach for first, and it is the one that quietly fails the actual requirement. Publishing to npm gives you versioning, not autonomy: shipping a module still means rebuilding and redeploying the host.

Module Federation is the runtime option with the ergonomics of the build-time one.

### The three properties that matter

Everything in Module Federation comes down to three fields.

- `exposes` — what this app publishes to others

- `remotes` — what this app consumes from others

- `shared` — what must be loaded exactly once across all of them

A remote publishes a component:

```js
new webpack.container.ModuleFederationPlugin({
  name: 'vueRemote',
  filename: 'remoteEntry.js',
  exposes: {
    './ComponentA.vue': '{path}/ComponentA.vue',
  },
  shared: { vue: { singleton: true } },
})
```

The host declares where to find it:

```js
remotes: {
  vueRemote: 'vueRemote@https://localhost:8081/remoteEntry.js',
},
```

And imports it asynchronously, because the bundle does not exist until runtime:

```js
ComponentA: defineAsyncComponent(() => import('vueRemote/ComponentA.vue'))
```

`shared` is the field that decides whether this works. Two copies of the framework loaded into one page will not throw a clear error — you get a component that renders but whose reactivity is silently detached, because it is bound to a different instance than the one the host is running. `singleton: true` is not an optimization. It is a correctness requirement.

> ⚠️ Mark every framework-level dependency as a singleton — the framework itself, the router, the state library. Anything that keeps module-level state will break in confusing ways if it is loaded twice.

### What broke first

Three things, in this order, every time.

**1. Types stop at the network boundary.** The host imports `vueRemote/ComponentA.vue`, which does not exist on disk. TypeScript has nothing to resolve, so you write declaration files by hand:

```ts
declare module 'vueRemote/ComponentA.vue' {
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

Hand-written declarations drift from the real component and nothing tells you. Generating them from the remote's build is the only version that stays true.

**2.&#x20;**`remoteEntry.js`**&#x20;URLs are environment-specific.** The URL in the config is a hardcoded origin, and it is different in development, staging, and production. Baking it into the bundle means a rebuild per environment, which undoes the reason you are here. Resolve remote URLs at runtime — from a config endpoint or an injected global — so one artifact runs everywhere.

**3. The entry has to be async.** Webpack needs to negotiate shared modules before your code runs. If the host's entry imports application code directly, that negotiation has not happened yet and you get an initialization error that reads like nonsense. The fix is a one-line indirection:

```js
// index.js
import('./bootstrap')
```

Everything real lives in `bootstrap.js`. This looks like a formality until you skip it.

### What it actually bought

Build and deploy time dropped, and the validation surface shrank — a change inside one module no longer required regression-testing the whole product. Those were the expected wins.

The unexpected one: **release conversations got shorter.** When a module can ship without coordinating, the question "can we deploy Thursday?" stops being a meeting.

The cost is that failures moved to runtime, where they are less visible. A missing remote is not a build error; it is a blank region in production. That is worth paying only when independent deployment was a real requirement to begin with.
