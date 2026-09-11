---
title: "Streaming to the Browser: SSE for Telemetry and for Agents"
lang: en
translationKey: streaming-to-the-browser-sse
publish: true
date: 2026-07-13
modified: 2026-08-23
tags: [javascript, networking]
description: The same protocol carried device telemetry in an energy product and agent reasoning in a security product. The failure modes were completely different. | Javas…
sourceUrl: https://cmun2.inblog.io/272256
sourceId: 272256
sourceCategory: Javascript
---

I have shipped Server-Sent Events twice, for problems that look similar on paper and behave nothing alike in production.

The first was energy telemetry: inverters reporting power flow every few seconds. The second was an AI agent streaming its reasoning while it investigated a security alert. Both are "server pushes text to a browser over HTTP." Both broke, in different places.

### Why SSE and not WebSocket

The decision is usually made backwards — people reach for WebSocket because it is more capable, then carry the cost of that capability forever.

|              | WebSocket        | EventSource (SSE)    |
| ------------ | ---------------- | -------------------- |
| Direction    | Bidirectional    | Server → client only |
| Data         | Binary or text   | Text                 |
| Transport    | Its own protocol | Plain HTTP           |
| Reconnection | You implement it | Built in             |

If the client never needs to push over the same channel, WebSocket buys you nothing and costs you a protocol upgrade, separate infrastructure handling, and hand-written reconnection logic. Telemetry and agent output are both one-directional. SSE was the smaller tool that fit.

The basic shape is unremarkable:

```js
const eventSource = new EventSource('/events/subscribe')

eventSource.onmessage = (event) => {
  console.log('New message', event.data)
}
```

And the wire format is just text with blank-line separators:

```
data: Message 1

data: Message 2
data: of two lines
```

### What the protocol gives you for free

Three things matter more than the API surface.

**Reconnection is automatic, and the server controls the interval.**

```
retry: 15000
data: reconnection delay is now 15 seconds
```

To stop a client from reconnecting at all, the server responds `204 No Content`. That is the entire mechanism — there is no client-side "give up" flag to manage.

**Message ids let a reconnect resume instead of restart.** The browser stores the last id and sends it back as `Last-Event-ID` on reconnect.

```
data: Message 1
id: 1

data: Message 2
id: 2
```

> ⚠️ `id:` goes **after** `data:`, not before. The client updates `lastEventId` only once it has taken the message. Put the id first and a connection dropped mid-message will resume from a point the client never actually received.

**Named events replace hand-rolled type dispatch.**

```js
eventSource.addEventListener('join',  e => console.log(`Joined ${e.data}`))
eventSource.addEventListener('leave', e => console.log(`Left ${e.data}`))
```

```
event: join
data: Bob

event: leave
data: Bob
```

For an agent, this is what separates `token`, `tool_call`, and `done` without inventing a JSON envelope and parsing a discriminator on every message.

### Case 1 — Device telemetry

Energy monitoring pulled from a polling loop. Polling was wasteful in the obvious way, but the real problem was that the interval was a lie: it reported "current" power flow that could be seconds stale, on a screen users read as live.

The implementation is ordinary except for two details that took time to get right:

```ts
state.sse = new EventSource(`${realtimeUrl}/${siteId}`, {
  withCredentials: true,
  headers: { 'X-AUTH-TOKEN': authToken },
})

state.sse.onmessage = (evt: MessageEvent) => {
  if (!Helper.isJSON(evt.data)) return
  state.data = JSON.parse(evt.data).monitoring_data as RealtimeMonitoringInfo
}

onBeforeUnmount(() => state.sse?.close())
```

**Always guard the parse.** The stream is text. A heartbeat, a comment line, or a truncated frame will reach `onmessage`, and `JSON.parse` throwing inside a stream handler kills the subscription without a stack trace anyone will connect to the symptom.

**Always close on unmount.** SSE connections survive component teardown. In an SPA, navigating between monitoring screens without closing leaves connections open, and the server hits its per-client limit long before anyone suspects the frontend.

### Case 2 — Agent reasoning

An AI investigation produces output for tens of seconds. Rendering nothing until it finishes wastes the most valuable property of the whole feature: an analyst can often tell within the first two lines whether a lead is worth following.

So the stream is not an optimization here. It is the product. The UI renders tokens as they arrive and the analyst can abandon a run early — which they do, often.

This shifted where the hard problems live:

- **Ordering and idempotency.** Reconnect mid-run and you may replay events. Without stable ids the transcript duplicates, and a duplicated reasoning step reads as the agent contradicting itself.

- **Terminal states are not errors.** "Finished," "aborted by user," and "connection lost" all arrive as a closed stream. Distinguishing them requires an explicit `done` event, because the transport cannot tell you why it stopped.

- **Rendering cost.** Appending to a growing transcript on every token will re-render the whole thing. Batching per animation frame, rather than per message, was the difference between smooth and unusable.

### The error-handling gap

This is the sharpest edge in SSE, and it is the same in both cases.

`onerror` receives an `Event`, not an HTTP response. There is no status code and no headers.

```js
state.sse.onerror = (e: MessageEvent) => {
  console.error(e)          // tells you almost nothing
  state.realtimeStatus = false
}
```

An expired token (401) and a crashed backend (500) are indistinguishable from the client. Since the browser retries automatically, an auth failure becomes a silent reconnect loop — the UI shows "connecting," the server logs a wall of 401s, and nobody is alerted.

Two workarounds, depending on how much control you have:

1. **Probe before connecting.** Check the session with a normal request first, so a 401 surfaces as a 401. That is why the telemetry code calls `checkConnection()` and fetches a fresh token before constructing the `EventSource`.

2. **Send failures as data.** If the server can emit `event: error` with a status in the payload before closing, the client gets a real reason. The transport cannot carry it — the message can.

### What I would tell myself earlier

SSE is a small protocol, and almost everything that goes wrong is in the space it deliberately leaves empty: what an error meant, whether a reconnect duplicated work, whether anyone closed the connection.

Pick it when the data flows one way. Then spend your effort on those three questions, not on the API.
