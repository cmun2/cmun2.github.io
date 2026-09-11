---
title: The Hydration Mismatch Was Not the Bug
lang: en
translationKey: ssr-hydration-node-mismatch
publish: true
date: 2024-04-29
tags: [nuxt, ssr, hydration]
description: A Nuxt SSR app kept throwing hydration node mismatch errors during auth. Silencing them was easy and wrong — the real problem was that the store finished loading after the layout had already decided what to draw.
---

> This is the English version of a Korean post. It is a rewrite, not a translation:
> the Korean original walks through the Nuxt lifecycle in detail because that is
> what I needed at the time. This version is about the mistake, which travels better.

We were building a B2C dashboard for a virtual power plant — customers watch their
generation and settlement figures. Two things about that product shaped every
technical decision. First-screen load time and SEO mattered, because a lot of our
users arrive from search and a lot of them are not young, so a blank screen that
resolves in two seconds is not a blank screen that resolves in two seconds, it is a
broken site. And money moves through it, so authentication is not a login form, it
is the thing that decides which numbers you are allowed to see.

So: Nuxt with SSR, Pinia for state, Supabase for social login, and a set of
composables handling access tokens, ID tokens, refresh tokens, expiry parsing.
Route middleware ran globally before the SPA took over, read tokens from cookies,
checked expiry, and redirected anyone without an access token to the login page
unless they were already on an allowed path.

Then the console filled up with hydration node mismatch errors.

## What the error actually says

A hydration mismatch means the HTML the server rendered and the HTML the client
would have rendered are not the same, so Vue cannot adopt the server's DOM and has
to throw it away. In our case the cause was ordinary: components rendered
differently depending on auth state, and auth state on the server (cookies, at
request time) was not auth state on the client (cookies, plus whatever the store
had since decided).

The fixes are well known and we applied them:

- `<ClientOnly>` around anything whose output legitimately only exists in the
  browser, so the server does not render it at all and there is nothing to
  disagree about.
- `watchEffect` for state that the client tracks and updates after mount.

The errors went away. I thought I was done. I was not, and the reason I was not is
the only interesting part of this post.

## The bug underneath

The mismatch errors were a symptom of a timing problem, and `<ClientOnly>` treats
symptoms. Here is the timing problem.

On login we initialised every store. That initialisation was asynchronous, and
nothing awaited it. The router moved to the dashboard as soon as login returned.
So there was a window — short, but not short enough — where the dashboard was
mounted and the stores behind it were empty.

Worse, we were not checking account role (admin / full member / associate member)
before drawing. On a page refresh the sequence was:

1. refresh triggers re-fetching the account's permissions,
2. refresh also re-renders the layout, including the navigation,
3. the navigation branches on role — and reads `accountInfo` before it has been set.

That is not a rendering inconsistency. That is a permissions component making a
decision with no data. On a site where the data is somebody's money, "renders
briefly wrong then corrects itself" is not an acceptable resting state.

Silencing the hydration warning would have hidden this. It nearly did.

## What we changed

The fix was to stop treating "logged in" and "ready to render" as the same moment.

**Do not draw the layout until the stores are populated.** The layout waits, and
while it waits it shows a loading bar. This sounds like a downgrade — we added SSR
for first-paint speed and now we are showing a spinner — but the alternative was
painting a layout that was about to be wrong.

**Fetch account info first, then everything else, in that order.** Role determines
what else needs loading, so it cannot be fetched in parallel with the things that
depend on it. We awaited the whole set and only then marked initialisation done.

**If any of it fails, log the user out and show an error.** A partially populated
store is worse than an empty one, because the empty one is obviously empty.

**Stop reloading the app after login.** The original flow called
`reloadNuxtApp()` after a successful login, which works but gives you no way to
show a loading bar during the reload — the page is gone. We replaced it with
`useAsyncData` to fetch everything up front and then a plain router navigation.
The side benefit is that `useAsyncData` gives you
[`refreshNuxtData`](https://nuxt.com/docs/api/utils/refresh-nuxt-data), so the
"reload the store" case that motivated the full reload in the first place now has
a real API behind it.

## What I would tell you

Two things, and the second one is the one I actually learned.

If you are doing SSR with auth, know the order in which middleware, store
initialisation and component render actually happen — not roughly, exactly. Nuxt's
lifecycle is documented; read it before you debug, not after.

And: a hydration mismatch is a *report* that the server and the client disagree.
It is worth asking what they disagree about before you make the report stop. Ours
was telling me that a permissions-sensitive component was rendering before its
data existed. `<ClientOnly>` made the message go away and left the condition in
place. It took a second round of bugs — role errors on refresh — to notice.

The uncomfortable version: the warning was more correct about my code than I was.
