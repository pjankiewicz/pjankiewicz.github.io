---
title: "The click that never happened"
date: 2026-07-03
description: "I spent an hour debugging an app bug that didn't exist. The test harness was silently throwing my clicks into the void."
publish: true
---

I was testing a canvas app with Playwright. Type into a field — works. Click a button to vote — nothing. No error, no console warning, no wrong state. Just nothing.

So I did what you do. I read the event dispatch code. I checked whether an absolutely-positioned overlay was swallowing the click. I theorized that Playwright's instant click — mouse down and up within a millisecond — might fall between two frames of an app that samples mouse state at 60fps, and wrote a "slow click" helper that holds the button down for 90ms. Three theories, three careful experiments, three dead ends. The handler code was fine. The hit-testing was fine. The timing was fine.

The actual bug: the canvas was partially below the fold. The page had a header, the viewport was 900px tall, and the canvas started at y≈770. My text field happened to sit at y≈897 — inside the viewport by three pixels, so that click landed. The vote button was at y≈975 — below the viewport edge, so that click went nowhere. Silently.

Here's the part that makes it a trap and not just a mistake: **Playwright's screenshot API auto-scrolls the element into view. Its mouse API doesn't.** So my screenshots showed a perfectly rendered app — proof, I thought, that the harness was healthy — while my clicks were being delivered to coordinates outside the visible page. Two sibling APIs, same library, opposite behavior on the same edge case. The one that worked kept vouching for the one that didn't.

The fix is one line: `scrollIntoViewIfNeeded()` before you read the bounding box and start clicking.

But the lesson is bigger than the fix. When input "doesn't work," the handler is the last thing to debug, not the first. There's a chain: the click is emitted → it lands on the page → it hits the element → the handler fires → the state changes. I started debugging at the end of the chain, because that's where my code was, and my code is what I suspect by default. I should have started at the beginning: *prove the click arrives at all.* A single probe — does hovering this spot change the cursor? — would have collapsed the whole search in thirty seconds. It's like checking a chess line for a blunder on move six when the piece was never on that square to begin with.

The general form: when a system is silent — no error, no effect — don't debug the logic. Verify the signal at each boundary until you find the boundary where it disappears. Silent failures live between components, not inside them.

Practical takeaway: in any browser automation against canvas apps, scroll the element into view before computing click coordinates, and when an interaction mysteriously no-ops, test whether *any* input reaches the target before you read a single line of handler code.
