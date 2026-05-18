---
title: "The bug at the seam: debugging with Playwright MCP"
date: "2026-05-18"
description: "Unit tests pass. Integration tests pass. CI is green. The toggle still doesn't do anything."
publish: false
---

## The bug

I shipped a feature today. Public profiles — toggle six switches on `/you/profile-settings`, fill a bio, hit Save. The page should remember it. Click the toggle, click Save, refresh — same thing comes back. That's the test.

I clicked the toggle. I clicked Save. I refreshed. The toggle was off again. The bio was empty.

Unit tests passed. Integration tests passed. CI was green.

## The seam

Here's what was wrong. There were two bugs, both at the seam between two layers that were correct in isolation.

**Bug 1 — Auth.** The frontend has a thin adapter wrapping the generated SDK. Half the calls go through `authed(() => SDK.foo())`, which attaches the JWT and refreshes it on 401. The Save call skipped the wrapper. The handler returned 401. The mutation surfaced a toast that scrolled off-screen.

**Bug 2 — A destructive "noop POST to read state".** There was no `GET /api/me/profile` endpoint. So on page load, the form fetched current state by POSTing to the upsert endpoint with an empty body, on the theory that an empty upsert reads back the existing row. It didn't. It overwrote bio, location, and goal with empty strings. Every page load nuked the row. Every post-save query invalidation nuked it again 50ms after the save succeeded.

Each bug had its own test on its own side. Backend tests insert-and-select on the upsert handler and pass. Frontend tests mock the SDK and assert that Save calls `updateProfileVisibility` with the right body. Both true. Neither catches *what happens when the two run against each other in a real browser*.

This is what people mean when they say tests give you false confidence. They do — for behaviour that lives entirely inside one process. For anything that spans the wire, you need a different tool.

## Playwright MCP

I was about to start reproducing the bug by hand. Open Chrome. Open devtools. Click the toggle. Read the network tab. Read the response body. Compare to the request. Run a SQL query. Repeat.

Instead I ran:

```
mcp__playwright__browser_navigate('http://localhost:5173/you/profile-settings')
mcp__playwright__browser_type(textarea#bio-input, '...')
mcp__playwright__browser_click(#toggle-bio)
mcp__playwright__browser_click('Save profile settings')
mcp__playwright__browser_network_requests(filter='api/me/profile')
mcp__playwright__browser_network_request(index=532, part='request-body')
mcp__playwright__browser_network_request(index=532, part='response-body')
```

Plus a `psql ... -c "SELECT bio_text..."` in a separate shell.

The whole loop ran inside the agent loop. I didn't need to point at devtools and read with my eyes. I asked for the request body of POST #532, got back the full JSON, and saw exactly what was sent. I asked for the response, got back the row the handler returned. Diffed it against the DB query 200ms later. The bio was there in the response. Gone in the DB. The next request, POST #533, was the noop reload — empty body, same handler, just wiped what #532 wrote.

Both bugs visible within 15 minutes of the report. No back-and-forth, no "can you check the network tab", no screenshots.

## What changed for me

Two things.

**First**, I now treat Playwright MCP as the load-bearing tool for any bug that involves the seam between frontend and backend. Not the *only* tool — unit tests still catch their share — but the one I reach for when something works in isolation and breaks in composition. Playwright on its own is fine; Playwright via MCP, where I can ask for the body of request #532 from the same agent that wrote the code, is a different category of tool.

**Second**, "noop POST to read state" is now a smell that gets flagged before merge. Two of my subagents independently came up with this pattern when they needed to load existing form state and there was no GET endpoint. Both worked in isolation. Both deleted data in composition. The right answer was a 10-line `GET /api/me/profile` handler that took less time to write than the workarounds.

The wider pattern: when you're tempted to make a write endpoint *also* serve as a read for convenience, write the read endpoint instead. It's cheap. The seam between read and write is also the seam where idempotency, defaults, and "what does an empty field mean" diverge silently.

## Coding loops that include the browser

This is what's interesting about MCP for me. We're used to feedback loops that end at "the test runs and prints OK." That's a closed loop with a fast cycle. But it only proves things about the slice you're testing. As soon as something crosses a process boundary — frontend to backend, backend to database, backend to a third-party — the closed loop breaks.

Playwright MCP closes the loop again, just over a wider span. The agent can ask the browser what it sent, ask the database what it stored, and decide whether those match. That's the test that catches "form looks right but data is gone."

Cheap to run. Cheap to read the output. Cheap to iterate. Five years ago this would have been a Selenium suite that took half a day to set up and broke twice a week. Right now it's three lines of tool calls.

The bug is fixed. The cost was 15 minutes. The bigger win is that this is now how I'll debug anything that crosses the wire.
