---
title: "UX testing is the bottleneck — Playwright MCP closes the loop"
date: "2026-05-18"
description: "Backend is solid. Frontend is fine. UX testing eats the rest of your day."
publish: false
---

> *"To anyone vibe coding web apps — testing web apps with Playwright MCP or Chrome DevTools MCP is pretty much obligatory at this time. It saves so much time. If you haven't tried it, do it now. Ask your agent to install those skills. Use it on your project."*
>
> — I posted that on [LinkedIn](#TODO-linkedin-url) earlier today. This is the longer version.

## Where the time actually goes

If you've shipped a webapp recently you know the shape of it. The backend is solid — handlers have unit tests, integration tests against a live DB, fixtures that exercise the unhappy paths. The frontend compiles, the types match the OpenAPI schema, vitest passes 200+ specs. Both layers look healthy.

Then you click around the actual app and discover that the form doesn't save. Or the toggle does nothing visible. Or the page renders but the data the page promised isn't there. The bug isn't in the backend. It isn't in the frontend. It's at the seam — the place where your beautiful unit tests don't reach because neither side owns the seam by itself.

That seam is where I spend most of my debugging time now. Backend work is solid. Frontend is ok. Testing the UX is the most time-consuming thing in shipping anything user-facing right now.

## A real example

Picture a form. Six toggles, a textarea, a Save button. Standard CRUD. Frontend wraps the generated SDK in a thin adapter; backend has a single upsert handler. The acceptance test is human-level: open the form, change a toggle, hit Save, refresh, see the change persisted.

I click the toggle. I click Save. I refresh. The toggle is off again.

Unit tests pass. Integration tests pass. CI is green.

Two bugs, both at the seam:

**Bug 1**: the frontend adapter has an `authed()` wrapper for any call that needs a JWT. Half the methods go through it; the Save method forgot. The handler returns 401. The mutation surfaces a toast that scrolls off-screen.

**Bug 2**: there's no `GET /api/me/whatever` endpoint, so the form's "load existing state" path POSTs to the upsert with an empty body, on the theory that an empty upsert is a no-op read. It isn't. The handler treats undefined fields as empty strings and clobbers the row on every page load and every post-save re-fetch.

Each bug had its own test on its own side. Backend round-trips the upsert and passes. Frontend mocks the SDK and asserts Save is called with the right body. Both true. Neither catches what actually happens when both run against the same browser, the same JWT, the same Postgres row.

This is the false confidence shape of testing. Tests give you certainty inside one process. Across the wire, you need something else.

## Playwright MCP

Five years ago debugging this would have looked like: open Chrome, open devtools, click the toggle, read the network tab with my eyes, copy the request body, copy the response body, query the DB in a separate shell, manually diff them, repeat.

This morning it looked like:

```
mcp__playwright__browser_navigate('http://localhost:5173/...')
mcp__playwright__browser_type(textarea, '...')
mcp__playwright__browser_click('Save')
mcp__playwright__browser_network_requests(filter='api/me/...')
mcp__playwright__browser_network_request(index=532, part='request-body')
mcp__playwright__browser_network_request(index=532, part='response-body')
psql ... -c "SELECT ..."
```

Inside the same agent loop. I asked for the body of POST #532, got back the JSON. Asked for the response, got back the row the handler returned. Diffed it against the DB query 200ms later. The data was there in the response. Gone in the DB. POST #533 was the reload firing the empty-body trick — same handler, wiped what #532 had just written.

Both bugs visible in ~15 minutes. No "can you check devtools and screenshot it for me." No back-and-forth. The agent saw what the browser saw, and what the database saw, at the same time.

## Screenshots are basically free now

One thing worth adding to the loop: take screenshots at every meaningful step. With Playwright MCP it's one tool call, the image goes straight into the conversation, and it costs you nothing to look at the result with your own eyes.

```
mcp__playwright__browser_take_screenshot
```

I take screenshots of:

- The page after each navigation, so I can see the actual visual state instead of inferring it from the accessibility tree
- The form before and after a Save, to catch the "field looked right but value is wrong" class of bugs
- Modal dialogs, dropdowns, hover states — anything I'd otherwise have to inspect manually
- Side-by-side comparisons when I'm rebuilding a screen and want parity with the old version

Screenshots used to be the thing you took at the end of a PR to put in the description. Now they're part of the inner loop. The agent navigates somewhere new, takes a screenshot, and I get an actual picture of what shipped. If the picture is wrong, I know in the next message — not after I've manually opened the URL and squinted at it. This single habit catches whole categories of bugs (broken layouts, missing icons, wrong copy) that no DOM-level test will ever see.

**Bonus points if you ask the agent to take screenshots specifically to validate design glitches** — the kind of thing a unit test can't see and a human eye picks up in 100ms. Spacing off by 4 pixels. Icon missing from a button. A modal that renders but the overlay didn't. Tell the agent "after each navigation, take a screenshot and tell me what looks wrong." You'll find things you would have shipped past.

## Why this is the unlock

Coding feedback loops have always been a function of how fast you can close them. Edit, save, see what happened. Type checker. Hot reload. The faster the loop, the harder the problem you can attack.

But every closed loop only proves things about its own slice. Unit tests close a loop on a function. Integration tests close a loop on a process. As soon as the bug spans two processes — browser, server, database — the loop opens up again and a human has to manually fuse the pieces. Read the network tab. Mentally line it up against the SQL query. Hold three windows in your head.

Playwright MCP closes that loop too, just over a wider span. The agent can drive the browser, read the network, query the database, and decide whether the answers agree. That's a different category of tool than "Playwright as a test runner." It's a test runner that's also an investigator.

Cheap to run. Cheap to read the output. Cheap to iterate. The same loop that gets you a unit test in five seconds now gets you a cross-process invariant check in fifteen.

## What changed for me

Two things.

**One**: Playwright MCP is now the load-bearing tool for any bug that involves the seam between frontend and backend. Not the only tool. Unit tests still catch their share. But when something passes its own tests and breaks in composition, this is what I reach for. Five minutes to set up, three lines of tool calls per loop.

**Two**: "noop POST to read state" is now a smell I flag before merge. Whenever you're tempted to make a write endpoint also serve as a read because "an empty write is a no-op", it isn't. Empty fields and missing fields are different on the wire. The seam between read and write is exactly where idempotency, defaults, and "what does null mean" diverge silently. Spend the 10 minutes to write the GET handler.

## The wider point

People talk about AI writing code as if the bottleneck is producing more code. For most user-facing work it isn't. The bottleneck is closing the loop on whether the code, as composed, does what a human expects. That's the slow part. Tools that compress that loop — that let the same agent that wrote the code also drive the browser and inspect the database — buy back the most time per hour I spend.

If you're shipping webapps and you haven't pointed Playwright MCP at your dev server yet, do that today. The first bug it catches will pay for the setup. Mine took 15 minutes instead of an afternoon, and the bug had been silently live for a day.

---

*If this post matched something you've been hitting, the [LinkedIn version](#TODO-linkedin-url) is a one-liner you can share. If you're already using Playwright MCP or Chrome DevTools MCP, like / share the LinkedIn post anyway — there's a long tail of people still debugging by hand who'd save hours by trying it.*
