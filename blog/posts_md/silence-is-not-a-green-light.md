---
title: "Silence is not a green light"
date: 2026-06-12
description: "My build gate reported a perfect batch — 195 files, zero failures. 190 of them had never been compiled at all. The lesson: never let a pipeline count the absence of errors as success."
publish: true
---

Last night an automated pipeline of mine reported its best run ever: 195 generated files, 100% passing the compile gate, zero reverts. A perfect batch.

This morning 190 of those files were broken.

The gate wasn't lying, exactly. It ran the compiler, collected every error, and attributed each one to a file. The batch's files had no errors against them. By the gate's definition of success — "no errors attributed to you" — everyone passed.

Here's what actually happened. The build covered a workspace of about twenty packages with a dependency chain between them. One file in a *low-level* package was broken. The compiler did what compilers do: it failed that package and **skipped everything downstream**. The packages where my 190 fresh files lived were never compiled at all. Zero diagnostics. Not because the code was good — because nobody looked at it.

And to my gate, zero diagnostics meant zero problems. It counted files it never verified as verified.

This is a general trap, and once you see it you find it everywhere:

- A test runner that reports green when a config error made it collect zero tests.
- A linter wired to the wrong directory, "passing" forever.
- A migration script that "processed" a table its filter quietly excluded.
- A monitoring alert that never fires because the metric stopped being emitted.

The shape is always the same: somewhere in the chain, a *failure to observe* gets translated into an *observation of no failures*. Silence and success have the same exit code.

In chess there's a difference between "I don't see a threat" and "I checked and there is no threat." Beginners conflate them; that's how you lose a queen to a move you never considered. My gate was a beginner. It didn't see any threats in those 190 files because it never looked at the board.

The fix was not more error handling. It was demanding **positive evidence**. The build tool I use emits an artifact message for every unit it successfully compiles. So now the gate's rule is: a file counts as verified only if its package produced an artifact *and* produced no errors. Files in packages that never built go into a third bucket — not passed, not failed: **unverified** — and unverified work is rolled back and re-queued, never landed.

Three buckets, not two. That's the whole fix. Pass, fail, and *don't know* — and "don't know" must never be allowed to masquerade as "pass."

The practical takeaway: find every gate in your pipeline that infers success from the absence of bad news, and ask what it would report if the thing it checks silently didn't run. If the answer is "success," you don't have a gate. You have a green light wired to nothing, and the day it matters most — the day something upstream breaks — is exactly the day it will wave everything through.
