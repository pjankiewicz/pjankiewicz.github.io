---
title: "Other People's Codebases Are the Best Test Suite You Never Wrote"
date: 2026-06-05
description: "When you build a tool that rewrites source code, the strongest test isn't your fixtures — it's running it on real third-party projects and checking they still compile and pass their own tests."
publish: true
---

I was building a tool that mechanically rewrites source code — the kind of thing that
moves chunks of a program around and has to not break anything. The scary class of tool.
A single off-by-one in how it handles visibility or imports and it silently corrupts
someone's project.

So I did the normal thing first: I wrote fixtures. A little input file, the expected
output, assert they match. Twenty of them. They passed. And I didn't trust them at all,
because I had written both the inputs *and* the tool, which means I had unconsciously
written inputs that exercised exactly the cases I'd already thought of. My fixtures were a
mirror, not a test.

Then I tried something else: I grabbed a couple of well-known open-source libraries —
real ones, with real test suites — ran my tool over their entire source tree, and then
ran *their* tests.

That's the whole trick. And it's much stronger than it sounds.

## Why this works so well

A mature library is an adversarial input generator that took years to build. It has every
weird construct you forgot existed: the obscure language feature used once, the
compile-time assertion with a throwaway name, the macro that hides a path from your
parser, the module nesting three levels deep with members that reach sideways into each
other. You would never think to write those fixtures. You don't have to. Someone already
did, as a side effect of solving a real problem.

And here's the part that makes it click: **you don't need to write any assertions.** The
library already came with its own definition of "correct" — its test suite. If your
transformation is sound, the tests still pass. If you broke something, a test that has
nothing to do with your tool lights up red and points at the exact behavior you changed.
The existing suite is a free, dense, behavior-level oracle.

It's differential testing, but you didn't have to build the reference implementation. The
reference is "the project, untouched." Compile-and-test before, apply your tool,
compile-and-test after. Any divergence is a bug in your tool.

## The compiler is half the oracle

For tools that operate on compiled languages, half the work is already done before the
tests even run. If the project compiled before and compiles after, you've ruled out an
enormous class of failures for free — every name-resolution, type, and visibility error
the compiler knows how to catch. The test suite then covers the rest: the things that
compile but behave differently.

I leaned on this so hard that I baked it into the tool itself. After every transformation
it runs the compiler, and if the result doesn't build, it rolls the change back to
byte-for-byte the original. The same property that makes real codebases a great test
oracle — "it has to still compile" — becomes the tool's runtime safety net. The test
methodology and the product feature turned out to be the same idea.

## What it actually caught

My fixtures were green. The real codebases were not. Within minutes I had a list of bugs I
would never have invented: an anonymous throwaway declaration my tool tried to export by a
name that doesn't exist; a reference that pointed "up and sideways" through the module tree
and broke when I moved its owner; a name collision with an import I wasn't tracking. Each
one was a real defect. Each one came from a construct I'd never have put in a fixture,
because I didn't know it was a problem until a stranger's code showed me.

Every bug I fixed, I *then* turned into a fixture — now that I knew it existed. That's the
right order. Real codebases find the cases; fixtures pin them down so they stay found.

## The takeaway

If you're building anything that transforms code — a formatter, a refactoring tool, a
migration script, a codemod — your own examples are a comfort blanket. Go find three real
projects that use the thing you're transforming, ideally ones with good test suites. Run
your tool over them. Run their tests.

The bar isn't "my twenty fixtures pass." The bar is "I can run this over a project I've
never seen, and its own test suite still passes." Until you've done that, you don't know
what your tool does. You know what you *think* it does, which is a different and more
dangerous thing.

---

The tool that prompted this — a splitter that turns a big source file into one-item-per-file
modules, verified by the compiler and rolled back if it ever fails to build — is open source:
[github.com/zenide/rust-split-modules](https://github.com/zenide/rust-split-modules). Every
real-codebase run it survived started as a row in a table that said "tests: pass → pass."
