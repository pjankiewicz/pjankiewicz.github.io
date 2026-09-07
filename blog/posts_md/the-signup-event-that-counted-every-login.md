---
title: The signup event that counted every login
date: 2026-09-07
description: Two dashboards, nine signups on one and two on the other. The event was named for what I wanted it to mean, not for what fired it, and the fix was one bit from the side that actually knew.
publish: true
---

One morning the analytics dashboard for a webapp said nine people signed up today. The admin page, which counts rows in the users table, said two. Both were "today". One of them was wrong, and my first instinct was to distrust the database.

The database was right. Nine decomposed into three unrelated things, and none of them was a bug in counting rows.

## Nine is three things

The first one was the clock. The analytics tool draws "today" in my browser's timezone. The admin page buckets by UTC. One of the nine events happened late the previous evening in UTC and this morning on my screen. Two dashboards that both say "today" and mean different days will disagree forever, and neither is lying.

The second was one phone. Six of the nine events came from a single device that had signed in with one provider, deleted the account, signed in with an email link, deleted that, and signed in again. Three account ids in thirteen minutes. Someone was testing the login page. Grouped by device, six events were one person.

The third was the one that mattered. The remaining events were logins. The event was called `user_signed_up`, and it fired from the post-login callback page on every sign-in, new account or not. It had done that since the day it was written. Nobody noticed because most days the two numbers were close: sessions persist, returning users rarely go through the callback, and the day's noise hid the semantics. Then a change sent returning users through the same doors as new ones, and the gap opened.

The event was named for what I wanted it to mean. It was defined by what fired it.

## The tempting fix

There was already a workaround in the code. The ads conversion, which really must fire only for new accounts, checked whether the user's `created_at` was less than five minutes old. Seconds old means the row was just inserted; days old means a returning login. I could have reused that check for the analytics event and been done in ten lines.

It's a guess. A good one, but a guess made by the wrong party. The browser is inferring, from a timestamp and its own clock, a fact that the backend had in hand a moment earlier when it decided whether to insert the row or look it up. A phone with a wrong clock misclassifies. A slow network on a slow day misclassifies. And every future door that creates accounts has to remember the same heuristic.

## One bit from the side that knows

The backend already computed "is this a new user" on every path, because it sends a welcome email on the new ones. It just never told the browser.

So it does now. The redirect that hands the session back to the app carries one more query parameter: `new=1` or `new=0`. The magic-link page, which already received the same boolean in its JSON response, forwards it the same way. The callback page emits `user_signed_up` on `new=1` and `user_signed_in` otherwise, with identical properties, so the two can be compared. The ads conversion and the post-signup offer read the same bit. The clock-based window is gone.

Why not just send the event from the backend, then? Because the event's job is attribution: which landing page, which channel, which session led to the account. That context lives in the browser and nowhere else. A server-side signup event would be a second copy of the users table, which I already had. The split is: the side that inserts the row decides, the side that owns the visit records.

One design choice worth stating out loud. A missing flag reads as a login, not a signup. If a future door forgets to carry the bit, it under-counts and the reconciliation catches it, because the two per-day numbers stop matching and the missing accounts show up as `user_signed_in`. The alternative, treating "absent" as "probably new", would fail silently in the direction that flatters you.

## What I do now

For any count that has an authoritative source, I reconcile the event against the source before quoting either. Same time boundary, written into the query, never read off two dashboards by eye. Grouped by device before reading a count as people.

And when an event needs a fact the emitting side has to guess, I look for the party that already knows it. Usually it's one bit, and usually it's already computed. It just has to be carried across.
