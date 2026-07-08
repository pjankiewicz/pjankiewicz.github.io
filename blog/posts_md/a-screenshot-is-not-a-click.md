---
title: A screenshot is not a click
date: 2026-07-08
description: Static screenshots of a web app will happily show you a beautiful, broken feature. Driving the app found a bug in ten minutes that a hundred passing tests missed — with a CDP driver in 100 lines and zero dependencies.
publish: true
---

I was verifying a new feature in a web app the other day. No Playwright in the
repo, no Cypress, nothing. So I did what everyone does: headless Chrome,
`--screenshot`, look at the PNG. The page rendered beautifully. Every panel in
place, every number right. Ship it?

Then I actually drove it — opened a detail dialog, clicked through a few
records. One panel claimed a record had no history. The data clearly said
otherwise; the API returned a full chain. The unit tests for that exact
function? All green. The test fixtures were built on an assumption about
uniqueness that real data politely declined to satisfy. Two components each
did the right thing; the seam between them was where the lie lived.

A screenshot can never catch that. A screenshot shows you the happy path in
its resting state. The bug was in what happens when you *interact* — and
"interact" is exactly what a static capture doesn't do.

Here's the part I want to sell you on: you don't need to install anything to
drive a browser. Node 21+ ships a native WebSocket client. Chrome ships the
DevTools protocol. That's the whole stack:

```js
// 1. Launch: chrome --headless=new --remote-debugging-port=9222
// 2. Open a tab, get its socket:
const tab = await (await fetch('http://127.0.0.1:9222/json/new?url=about:blank',
  { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
// 3. Everything is { id, method, params }:
send('Page.navigate', { url });
send('Runtime.evaluate', { expression, returnByValue: true });
send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', ... });
send('Page.captureScreenshot', { format: 'png' });
```

A promise map keyed by `id`, four helper functions, about a hundred lines.
Real clicks via mouse events at an element's bounding box, real typing, real
keyboard shortcuts — the kind that hit `window`-level handlers, which
`element.click()` shims never exercise. Screenshot after every step so you
have evidence instead of memory.

Think of it like chess analysis. Staring at a position tells you it *looks*
fine. You only find the refutation by playing the moves. The screenshot is
the position; driving is the line.

Three gotchas that each cost me a few minutes, so they cost you none:

- React `<select>` ignores `el.value = x`. You need the native prototype's
  value setter, then `dispatchEvent(new Event('change', { bubbles: true }))`.
- CSS modules hash class names. Select on `[class*="stem"]`, roles, or text —
  never the full class.
- `input[type="text"]` doesn't match an `<input>` with no `type` attribute.
  The DOM *property* defaults to `"text"`; the attribute selector wants the
  attribute.

And one workflow tip: recon before you drive. First script just dumps what's
there — button texts, inputs, selects. Then write the interaction script
against reality instead of guessing selectors and burning a round-trip per
typo.

The takeaway isn't "CDP is neat" (it is). It's that the bar for "I verified
this" is behavior, not appearance — and the tooling excuse is gone. If the
machine has Chrome and a recent Node, you are a hundred dependency-free lines
away from clicking the buttons your users will click. The bugs that matter
live behind those clicks.
