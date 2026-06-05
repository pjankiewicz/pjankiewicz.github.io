---
title: "Retrying Is Not Replanning"
date: "2026-05-20"
description: "Why AI code generation needs to redo the plan, not just redo the function"
publish: true
---

## The function that wouldn't compile

I was watching an AI system build a piece of software by decomposing it into a graph of small functions. Each function gets written, compiled, and tested on its own. When one fails, the system feeds the compiler error back to the model and asks it to try again. Three tries, then a longer tool-using fix loop, then — if it still won't go green — it gives up on that node and moves on.

Most of the functions sailed through. A few got fixed on the second or third try. But one function kept failing in a way no amount of retrying could fix. It was a parser for expressions with operator precedence, and the model kept trying to cram the whole thing into one body. Every retry produced a slightly different version of the same too-big function. The error changed; the outcome didn't.

That's when it clicked: the system could retry, but it couldn't *reconsider*. And those are very different things.

## Two kinds of being wrong

When you're stuck on a problem, there are two reasons you might be failing.

The first is a local mistake. You had the right plan, you just botched a detail — an off-by-one, a wrong type, a forgotten case. The fix is to look at the error and patch the detail. Retrying with feedback works great here. This is the case everyone builds for, because it's the common one.

The second is a structural mistake. The plan itself was wrong. You decided to write one function where you needed five. No amount of patching the one function helps, because the unit of work was mis-sized from the start. Retrying here is like rewording a sentence that needed to be a paragraph — you can polish forever and never get there.

Almost every AI coding setup I've seen handles the first kind and silently assumes the second never happens. But the second kind is exactly what shows up the moment the task gets big. Small tasks rarely have structural mistakes — there's not enough structure to get wrong. Big tasks are *mostly* structure.

## Replanning is the missing primitive

The fix is to let failure flow up a level. When a node exhausts its retries, it shouldn't just record "failed" and move on. It should report *what* failed and *why*, and hand that back to the planner. The planner then writes a new plan that targets only the gap — and crucially, it's allowed to decompose differently. The function that was too big becomes a handful of helpers plus a thin function on top. That's not a retry. That's a replan.

This maps onto how people actually write hard code. You build something, see what breaks, and sometimes the lesson is "this should have been three things." You don't keep rewriting the one thing. You step back and re-cut the boundaries.

The structure that makes this work is a loop, not a line:

1. Run the plan.
2. Collect the failures — with their errors, not just a count.
3. If anything's still broken, re-read the current state of the world and plan only the remaining gap.
4. Run that. Repeat until green or you run out of budget.

The "re-read the current state" step matters more than it looks. By the time you replan, everything that *did* succeed is already committed. The new plan builds on real, working parts instead of replaying the whole thing. Each round starts from a better world than the last. It's the same reason a chess engine doesn't re-search the whole tree from move one every time — you keep what you've established and push the frontier.

A subtle bonus: retries are cheap and local, replans are expensive and global, and you want both. Retry the typo. Replan the architecture. Use the cheap tool first and escalate to the expensive one only when the cheap one stops making progress. A node that burns its retries without converging is itself a signal — it's telling you the problem is structural, so stop retrying and replan.

## While you're at it, order the work

There's a second lesson hiding next to this one. If you're generating a graph of functions and some call others, the order you build them in matters enormously.

Naively you fan them all out in parallel — it's faster, and most of them are independent. But if function A calls function B, and you write A before B exists, A won't compile. It references something that isn't there yet. So A "fails," kicks off a retry, maybe even a replan — all to recover from the fact that you simply built things in the wrong order.

The cure is old and boring: a dependency graph and a topological sort. Figure out what calls what, build the callees first, and run everything that's independent in the same wave, in parallel. Callees before callers; siblings together. Re-snapshot the world between waves so each caller sees its freshly-built callees.

This is the difference between converging in two rounds and thrashing for eight. Every avoidable ordering failure is a wasted model call, and model calls are the whole cost. Treating code generation like query planning — figure out the dependencies, schedule the work, parallelize what you can — turns a pile of hopeful retries into something that looks a lot more like a build system.

## The takeaway

If you're building anything that has AI generate code at scale, ask two questions. When a piece fails, can the system change the *plan*, or only redo the *piece*? And when pieces depend on each other, does the system know the order, or is it hoping parallelism works out?

Retries get you the easy 80%. Replanning and ordering get you the part that actually matters — the structure. The model was never the bottleneck. The loop around it was.
