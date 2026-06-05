---
title: "The bug was in the path nobody ran"
date: 2026-06-05
description: "A feature can pass every test and still be broken — if your tests take a different road through it than production does."
publish: true
---

I shipped a feature a while back, wrote tests for it, watched them go green, demoed it. Some time later someone pointed it at a real database and it crashed on the very first try. Not a flaky crash. It had never worked. Not once. And the tests had been green the entire time.

Here's how that happens, because it's more common than the green dashboard makes it look.

The feature applied a batch of schema changes at the moment you cut a release. It was written to support a couple of different storage backends. The thing I built it against — the thing the tests ran against, the thing in the demo — used the simplest backend: an in-memory key-value store. Real users pointed it at a real SQL database.

Those two backends take two different roads through the same feature. The key-value road went through a helper that quietly did its work on a background thread. The SQL road called the database driver directly, inline, on the main request.

And the SQL driver was a synchronous wrapper around an asynchronous one. To bridge that gap it spins up its own little async runtime under the hood. But the server it was running inside *was already* an async runtime. You can't start a runtime inside a runtime — the language panics the instant you try. So the publish handler died on its first call, the request came back empty, and the schema change silently never happened.

Every test passed because every test used the in-memory backend, which never goes anywhere near the driver that panics.

It's like proofreading a book by re-reading only the chapters you wrote yourself. The typo is always in the chapter you skipped.

The thing I want to underline is this: "it has tests" and "it works" are different claims, and we constantly let the first one stand in for the second. Tests only prove the paths they actually execute. If your tests and your demo both take the easy road — the in-memory backend, the happy-path login, the ten-row input — then the hard road is unverified no matter how high the coverage number climbs. Coverage counts lines, not configurations. You can run every line of a function and still never run it in the mode that breaks.

And the easy road wins by default, every time, because it's easy. It's the one in the README. It's the one that doesn't make you provision a real database before you can see a green checkmark. So it quietly becomes the *only* road anyone ever travels, and the feature rots in the exact configuration you hand to customers.

Two things help.

First, the cheap discipline: when a feature forks on configuration — backend, auth mode, platform, free vs. paid — make sure at least one run takes each fork. Not the full cartesian product of every combination; that's a trap of its own. Just answer one question honestly: *did the SQL path ever execute, end to end, even a single time?* If the answer is "no, but the logic is shared," the answer is no. Shared logic is exactly where the divergence hides, because nobody's looking there.

Second, the small technical lesson, because it bites people who'd never expect it: a synchronous client that wraps an async one almost always creates a runtime internally. Call it from inside your async server and you get a panic, not a helpful error. If you have to use one, push it onto a real OS thread that isn't part of your runtime, and let it build its private runtime there in peace. My actual fix was three lines — run the blocking work on a dedicated thread, exactly like the key-value path had been doing all along.

But the three lines were never the bug. The bug was that nobody had ever run the path those three lines lived on. The fix took ten minutes. Finding out it was broken took months, and only happened because someone finally used the boring, important configuration instead of the fun demo one.

The scary part isn't that it broke. It's how long it sat there, green, waiting.
