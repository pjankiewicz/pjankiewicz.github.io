---
title: "My Backtracker Counted the Same Answer 5,040 Times"
date: 2026-06-11
description: "A backtracking search kept reporting 'ambiguous' on inputs with exactly one solution. The search was correct — it was just enumerating every solution in every possible order, and tripping its own safety cap."
publish: true
---

I have a small library that applies AI-generated patches to files. The hard part isn't parsing — it's placement: a patch hunk says "delete this line, here's some context around it," and the matcher has to find where in the file that hunk belongs. When several hunks could land in several places, it runs a backtracking search over the assignments. If exactly one final file can result, apply it. If two different files can result, refuse — report the patch as ambiguous and make the model add more context. That refusal is a feature. Silently picking one interpretation of an ambiguous patch is how you corrupt files with confidence.

Backtracking can blow up exponentially, so the search had a safety cap: visit more than 100k nodes and give up, reporting "ambiguous." Conservative default, seemed harmless.

Then a perfectly unambiguous patch — seven identical one-line deletions, seven places they could go, every assignment producing the *same* resulting file — came back as ambiguous. There was provably exactly one answer. The search insisted there were two.

The bug wasn't in the matching, the dedup, or the cap. It was in what the search was counting.

At every node, the search branched on *every* remaining hunk: "try hunk A next at each of its positions, then try hunk B next at each of its positions..." That feels natural — it's how you'd write the recursion without thinking. But a finished solution is just an assignment of hunks to positions. It does not care what order you assigned them in. Placing A then B reaches exactly the same final mapping as placing B then A. The search was enumerating each mapping once per ordering — that's a factor of k! for k hunks — and the node count exploded as the square of the naive estimate: seven interchangeable hunks meant tens of millions of nodes for what was, underneath, 5,040 distinct assignments and *one* distinct answer. The cap tripped at 100k, and the cap's failure mode was "report ambiguous." So a correctness guard plus a performance guard combined into a wrong answer.

In chess terms: it's move-order blindness, the thing transposition tables exist for. 1. e4 e5 2. Nf3 and 1. Nf3 e5 2. e4 are different move sequences arriving at the same position, and an engine that analyzes the position fresh each time it arrives by a new order is wasting almost all of its effort. My search had no notion of transposition at all. Every ordering of the same assignment looked like new work.

The fix is embarrassingly small. At each node, don't branch on every remaining hunk — designate *one* (the first eligible) and branch only on its positions. Since every complete solution must place every hunk eventually, and since feasibility doesn't depend on order (two hunks overlap or they don't, regardless of which was placed first), fixing the assignment order loses nothing. Each final mapping now gets enumerated exactly once. You even get a stronger prune for free: if the designated hunk has no feasible position right now, it never will on this path — the constraints only tighten — so the whole branch is dead immediately.

One more layer fell out of benchmarking the fix. Even enumerating each mapping once, interchangeable hunks still produce many mappings with identical *results* — swap two identical deletions and you get a different mapping but the same file. The old dedup materialized the full output file at every completed path just to compare it against the first one. For a 2,000-line file that's thousands of full-file builds whose only purpose is to conclude "yes, same as before." But two mappings that assign the same *content* to the same *positions* cannot produce different files — so you can compare a sorted list of (position, content-class) pairs, a few dozen integers, and only build the actual file when the cheap key says the mappings genuinely differ. The pathological case went from a false "ambiguous" after 1.4 seconds of churn to a correct answer in 7 milliseconds.

What I'm keeping from this:

- **Know what your search enumerates: sequences or outcomes.** If the answer is a set (an assignment, a subset, a partition) and your recursion branches on "which element next," you're enumerating orderings of outcomes and paying a factorial tax for it. Either fix the order (canonical element next) or detect transpositions. This is the same bug whether it's a patch matcher, a scheduling solver, or a chess engine without a transposition table.
- **A safety cap converts slowness into whatever your fallback answer is.** Mine converted it into "ambiguous," which callers treat as a definitive verdict about the input. It wasn't — it was a verdict about my node budget. If a cap can fire, ask what the caller will believe when it does, and whether that belief is ever a lie about the input rather than a confession about the algorithm.
- **Benchmark after correctness fixes, not just performance ones.** The factorial blow-up was invisible in unit tests with two or three hunks. It only surfaced because I benchmarked a slightly bigger case and the "obviously fine" search took ages before failing. The gap between n=5 working and n=7 misreporting was one innocent-looking loop.
