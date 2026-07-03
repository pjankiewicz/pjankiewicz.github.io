---
title: "Your oracle has bugs too"
date: "2026-07-03"
description: "Differential testing against a reference implementation works great — until the reference is wrong. What a red CI on exactly one OS taught me about oracle tests."
publish: true
---

CI went red on Linux and stayed green on macOS and Windows. Same commit, same test, same inputs. That's usually the start of a bad afternoon. This time it was the most informative failure I'd seen all month.

The test was an oracle test. I had a pure-Rust reimplementation of C's `printf`-style formatting, and the test hammered it against the platform's actual libc `snprintf` across tens of thousands of flag/width/precision/value combinations, asserting byte equality. Classic differential testing: don't write expected values by hand, ask the reference implementation.

The failing case was `%#g` of `999999.5`. My code said `1.00000e+06`. glibc said `1.e+06`.

Here's the thing: the C standard is unambiguous about this. The `#` flag for `%g` means trailing zeros are *not* removed. But when rounding pushes the value across a decade boundary — 999999.5 rounds up to 1e+06 — glibc strips them anyway. BSD libc keeps them. My implementation followed the standard, and the standard-following output is what failed the test.

So the test was asserting "matches whatever this machine's libc does", and one machine's libc was wrong. The oracle had a bug.

It happened again the same day, in the other direction. The same reimplementation covered `strftime`-style date formatting, and `%z` (the UTC offset) came out as `+0100` on macOS for a time that was explicitly UTC. Not my code — raw libc. I wrote a five-line C program to check: fill a `struct tm` with `gmtime_r` (which sets the offset field to zero), format it with `%z`, and macOS prints the *local* timezone offset anyway. It ignores the field entirely and recomputes from process-global state. glibc reads the field, like you'd expect.

Two references, two disagreements, both in corners where the implementations quietly diverge from each other and sometimes from the spec.

The fix is not to make your code bug-compatible with one platform. Chase glibc's quirk and the macOS oracle fails; chase macOS and Linux fails. You cannot win that game, because the referees disagree with each other.

What works is splitting the test in two:

1. **Pin the behavior you chose in deterministic unit tests.** Hand-written expected strings, no libc involved. `%#g` of 999999.5 is `1.00000e+06`, on every platform, forever. This is where you encode the decision and the reasoning — a comment saying "glibc strips these zeros, C99 says keep them, we follow C99" is worth more than a thousand green oracle runs.

2. **Run the oracle only where the implementations agree.** Exclude the known quirk zones from the differential sweep — skip the `#` flag for `%g`, oracle-check `%z` only on the platform whose semantics you adopted. The oracle still buys you enormous coverage over the boring 99% where every libc agrees, which is exactly where your own bugs live.

The mistake to avoid is the silent version of this: loosening the assertion, fuzzy-matching, or deleting the failing case with no comment. Six months later nobody knows there was a decision here. The skip needs a paragraph explaining what the platforms disagree about and which side you picked, or you've just buried a landmine for the next person who "fixes" the exclusion.

There's a more general point underneath. Differential testing quietly assumes the reference is correct, but the reference is just another program. Mature, battle-tested, and still carrying decades-old quirks that survive precisely because everyone tests *against* them instead of *checking* them. When your implementation and the oracle disagree, you haven't found a bug yet — you've found a disagreement. Sometimes it's yours. Sometimes it's theirs. The C standard, a second reference implementation, or a five-line reproducer against raw libc settles it.

And that per-OS CI matrix everyone maintains but rarely thinks about? A failure on exactly one OS with the same code and inputs is not noise to retry away. It's the build system handing you a cross-platform behavioral difference, localized to a single test case, for free. Read it before you rerun it.

The takeaway: an oracle test is a comparison, not a verdict. When it fails, ask which side is wrong before you "fix" your code — and when the answer is "the oracle", write down the disagreement, pin your choice deterministically, and shrink the oracle's jurisdiction to where the references actually agree.
