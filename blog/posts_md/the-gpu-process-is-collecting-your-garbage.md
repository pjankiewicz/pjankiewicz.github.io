---
title: "The stall wasn't in my code — the GPU process was collecting my garbage"
date: 2026-06-11
description: "A WebGPU animation froze for half a second every few seconds. The profiler said my code was innocent. The real culprit was 4.5 GB/s of texture allocations nobody could see."
publish: true
---

A WebGPU animation I was responsible for froze for 200–500ms every six seconds or so. Not
dropped frames — hard freezes. The kind users describe as "it stutters".

The obvious move is to profile your own code. I did. The main thread was clean: one 53ms
GC over a 35-second trace, everything else under 10ms. JavaScript innocent, wasm innocent.
By the usual rules of debugging, there was nothing left to fix.

Except the trace had a second process in it. Chrome runs GPU work in a separate process,
and *that* thread showed clusters of 200–300ms tasks, exactly lining up with the freezes.
My code wasn't slow. Something I was *asking the GPU process to do* was slow.

## Counting what the profiler doesn't show

Here's the trick that cracked it. You can wrap the WebGPU API from the page and just
count calls:

```js
const counts = {};
const orig = GPUDevice.prototype.createTexture;
GPUDevice.prototype.createTexture = function (...args) {
  counts.createTexture = (counts.createTexture || 0) + 1;
  return orig.apply(this, args);
};
```

Prototype patching catches calls from wasm too — the bindings go through the same
prototypes. Ten lines of console code, and suddenly I had numbers nobody had ever looked
at: the renderer was creating **textures every single frame**. A 16MB shadow map. Two
canvas-sized depth buffers. Around 40–60MB of fresh GPU allocations, 120 times per
second. Roughly 4.5 GB/s of allocation traffic, frame after frame, for an animation of
three spheres.

Each individual allocation is fast — that's why no single frame looked bad. But the GPU
process has to reclaim all of it, and it does that in bursts. Every few seconds it
stopped the world to take out the trash. The freezes were garbage collection — just not
in the runtime anyone profiles.

## "We have a cache" is not "we use the cache"

The embarrassing part: the renderer *had* a texture pool. A good one, modeled on a
production engine's design — free lists keyed by texture descriptor, reuse across frames,
age-based eviction. The big color buffers went through it faithfully.

The shadow map didn't. Neither did the depth prepass, nor a couple of auxiliary buffers.
Those call sites predated the pool, called the raw device API directly, and nothing ever
flagged them. There was even a test asserting "the pool gets reused across frames" — and
it passed the whole time, because it asserted on a counter that only the pooled code path
incremented. The bypassing paths were invisible to the very test meant to catch them.

That's the general lesson, and it has nothing to do with graphics. When you add a cache,
a pool, a rate limiter — any *discipline* layer — there are only two trustworthy states:

1. **Enforced by construction.** The undisciplined operation is impossible to express.
   The reference engine I was porting from gets this right: every per-frame resource is
   declared on a graph, the graph allocates through the cache, and there is simply no API
   for a render pass to allocate around it.

2. **Enforced by a test that measures the raw boundary.** Not "did the cache get hits"
   but "did the expensive thing happen at all". My fix-side test asserts a warm frame
   performs **zero** device-level texture creations. It would have failed loudly for the
   entire lifetime of the bug. The old test, which measured the cache's own bookkeeping,
   was a mirror asking itself if it looked good.

Anything in between — convention, code review, a comment saying "use the pool" — decays.
New call sites get written by someone (or something) that didn't read the comment.

## The takeaway

If your app talks to a subsystem in another process — a GPU, a database, a render
server — your profiler shows you the *requests*, never the *cost of the mess you leave
behind*. When you see periodic stalls that your own flame graph can't explain: count the
allocations crossing the boundary. Ten lines of prototype patching beat hours of staring
at a clean profile.

And when you fix it, don't write the test that checks your cache is happy. Write the test
that checks the expensive thing stopped happening.
