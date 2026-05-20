---
title: "Your monolith is probably already a DAG"
date: "2026-05-20"
description: "We assume big crates are too tangled to split. Most of the time the tangle is imaginary — and measurable."
publish: true
---

There's a kind of code everyone is scared to touch. One giant module, tens of thousands of lines, years of accumulated everything. You know it's slow to compile. You know splitting it into smaller pieces would let the compiler cache and parallelize. And you don't, because you're sure it's a hairball of circular dependencies and the first cut you make won't compile.

I've believed that about my own code more than once. Then I got curious and decided to stop believing and start measuring.

## The thing that's actually in the way

In most languages you can split a big file whenever you like. In Rust the unit of compilation is the crate, and crates are not allowed to depend on each other in a circle. A → B → A doesn't compile, full stop. So splitting a monolith isn't about moving code — your editor does that fine — it's about choosing *what goes where* so the result is a directed acyclic graph. A DAG. No cycles.

That's a graph problem, not a vibes problem. So I wrote a small tool that builds the graph: every module is a node, every `use` of another module is an edge. Then it asks two questions. Is this already acyclic? And if not, what is the *cheapest* set of edges to remove to make it acyclic?

That second question matters because not all edges are equal. If module A references module B three hundred times, that's the real direction of data flow — leave it. If B references A *once*, that single backward reference is what closes the cycle. Cut the one, not the three hundred. (It's the feedback-arc-set problem, and the cheap heuristic for it is older than I am.)

## What I found when I pointed it at real code

I ran it on a handful of well-known open-source Rust projects — the kind people describe as monolithic.

The first surprise: a lot of them aren't tangled at all. One crate of about ninety thousand lines came back **already acyclic** at the module level. Zero edits required. Thirty of its modules could each become their own crate this afternoon and the whole thing would still compile. The "monolith" was one big folder, not one big knot.

The second surprise was about the ones that *did* have cycles. They were trivially close to splitting. A project with a fifty-thousand-line blob untangled completely after rerouting about twenty references — and most of those were one-line type imports sitting in the wrong place. A shared struct defined "up" in the stack that a foundational module reached up to grab. Move the struct down into a small shared crate, and the cycle evaporates.

So the cost of splitting these "untouchable" monoliths wasn't a rewrite. It was a morning of moving a dozen types into the right place, in an order a tool can hand you ranked cheapest-first.

## Why the fear outlives the facts

Here's the part I keep thinking about. The reason these crates stay monolithic isn't that they're hard to split. It's that everyone *assumes* they're hard to split, so nobody checks, so they grow, so the assumption gets more intimidating. The fear is self-fulfilling. It compounds like interest.

It's the knot that looks hopeless until you notice it's a slip knot — one pull and it's gone. You can stare at it for years and never see that, because staring isn't measuring.

## The honest caveats

Two, because I don't trust tools that don't tell you where they're blind.

A path-based analyzer like this reads explicit references. It can miss coupling that hides behind glob re-exports or pure type inference, where no module name is ever written down. So "already acyclic" is really "acyclic as far as the visible wiring shows" — a lower bound on how much work splitting takes, not a guarantee of zero.

And lines of code is a lazy proxy for compile time. A small macro-heavy module can cost more than a large plain one. The graph tells you the *shape*; it doesn't tell you the seconds.

Even with both caveats, the conclusion held: the structure of these projects was consistently better than their reputation.

## The takeaway

Before you declare a piece of code unsplittable, build the graph and look. Not the mental model of the graph — the actual one. Coupling you can see is coupling you can fix, usually for far less than you feared. The reputation of your monolith is a story your team tells each other. The DAG is a fact. Go check which one is true.
