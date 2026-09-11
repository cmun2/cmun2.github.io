---
title: Why I Kept setInterval
lang: en
translationKey: requestanimationframe-vs-setinterval
publish: true
date: 2025-04-17
tags: [javascript, performance]
description: requestAnimationFrame is the better API for almost everything setInterval is used for. I still shipped setInterval, because a resend countdown is not an animation — and the distinction turns out to be the whole argument.
---

> This is the English version of a Korean post. It is a rewrite rather than a
> translation — the Korean original is a comparison table, this one is the
> decision I made with it.

The feature was unglamorous: a phone verification screen. Send a code. You may
resend once immediately. After that, once per minute. If the user edits the phone
number, everything resets and immediate resend is available again. While the
cooldown runs, the button shows a countdown.

Several of these timers can be alive at once, and they interact, which is why I
stopped to think about it at all rather than reaching for the first thing.

The obvious thing to reach for is `setInterval`. The thing you feel slightly
guilty for not reaching for is `requestAnimationFrame`, because everything you
read says `rAF` is the modern, performant, battery-friendly one. I read all of
that, and then shipped `setInterval`.

## The case for rAF, which is real

None of this is wrong:

**It runs when the browser is about to paint.** Callbacks fire immediately before
a frame, so what you draw actually lands on that frame instead of somewhere in the
middle of the browser's schedule. That is why animations built on it look smooth
and animations built on `setInterval` stutter and drop frames.

**It stops when nobody is looking.** Background the tab and rAF stops being
called. `setInterval` keeps firing into a document nobody can see. On mobile that
is battery.

**One clock for all of it.** Ten rAF animations share the browser's single frame
timer. Ten `setInterval`s are ten timers.

**It cannot pile up.** With `setInterval`, if a tick takes longer than the
interval, the next one is already queued and you get overlapping executions — the
classic bug where an animation you forgot to `clearInterval` runs on top of itself
and everything jerks. rAF does not schedule the next callback at all unless you
ask, inside the callback, with another `requestAnimationFrame`. Forgetting to
continue stops the loop; forgetting to stop a `setInterval` runs it forever.

That last property is worth seeing rather than reading. Naive recursion for one
second of logging:

```javascript
let after1sec = new Date(Date.now() + 1000)
function printTime() {
  if (after1sec.getTime() - Date.now() > 0) {
    console.log("record!")
    printTime()
  }
}
printTime()
```

That blows the call stack — it recurses as fast as the engine will let it. The
same loop through rAF:

```javascript
let startTime = null
function printTime(timestamp) {
  if (!startTime) startTime = timestamp
  console.log("record!")
  if (timestamp - startTime < 1000) {
    requestAnimationFrame(printTime)
  }
}
requestAnimationFrame(printTime)
```

runs about sixty times, because the browser paints about sixty times a second and
that is the only rate rAF offers. The rate limit is the feature.

## Why I did not use it

Because the rate limit is also the problem, and because a countdown is not an
animation.

**rAF has no interval.** You do not get to say "every second". You get "every
frame", which is 60 Hz on most displays, 120 on some, and whatever the browser
feels like when the machine is busy. To count seconds you would track elapsed time
across frames and fire on the boundary yourself. That is more code doing the same
job worse, sixty times a second, to update a number that changes once a second.

**rAF stops in a background tab, and my timer must not.** This is the same
property, read from the other side. If a user starts a 60-second cooldown, switches
tabs to read the SMS, and comes back, the cooldown must have been running the whole
time. With rAF it would have been paused, and the user would be sitting in front of
a button that is wrong. For an animation, pausing when hidden is correct. For a
policy — *you may resend once per minute* — it is a bug.

**Interval drift does not matter here.** `setInterval` does not really fire every
1000 ms; it queues the callback and the event loop runs it when it can, so error
accumulates. That is fatal for anything where the interval *is* the value, and
irrelevant for a button label counting down from 60. If it mattered I would not fix
it with rAF anyway — I would compute remaining time from a stored timestamp and let
the interval merely decide how often to re-read the clock.

So:

```javascript
function isButtonValidAfterOneMinute() {
  isAuthResent.value = true
  const interval = setInterval(() => {
    resendButtonValidTime.value--
    if (
      resendButtonValidTime.value <= 0 ||
      isAuthResent.value === false ||
      isVerified.value === true
    ) {
      clearInterval(interval)
      resendButtonValidTime.value = 60
    }
  }, 1000)

  setTimeout(() => {
    isAuthResent.value = false
    clearInterval(interval)
  }, 60000)
}
```

One tick per second, three separate exit conditions — expiry, a reset from the
phone-number field, and successful verification — and a `setTimeout` backstop so
the timer cannot outlive its own window. `clearInterval` is called on every path
out. In a component you clear it on unmount too; an interval that survives its
component is the memory leak everyone means when they warn you about
`setInterval`.

## Where I would have switched

I would use rAF here if the countdown drove something continuous: a progress ring
draining smoothly, a colour transition as the cooldown expires, a button that
morphs rather than swaps. The moment the visual output changes per frame rather
than per second, rAF is not the fussier option, it is the only correct one — and
`setInterval` at 16 ms to fake it is exactly the stutter rAF exists to prevent.

The rule I ended up with, which is less clever than the comparison table I started
with: **`requestAnimationFrame` is for things the eye follows. `setInterval` is for
things the clock decides.** A countdown looks like the first and is the second.
