---
title: "The Tree Was Correct and Still Wrong"
date: "2026-06-10"
description: "A scene tree built faithfully from a data-flow graph confused everyone who looked at it. The data was right. The orientation was backwards."
publish: true
---

I built a scene tree for a node-based editor. The kind of left-panel outliner
every design tool has: a list of objects, expandable, click to select.

The tree was generated from the underlying graph. In a data-flow graph, edges
run from sources to results: a shape node feeds a transform node feeds a
material node feeds the output. So the natural way to build a tree is to start
at the output and walk backwards. The root of each object becomes the *last*
operation applied to it, and the shape the user actually created ends up as the
deepest leaf.

Every test passed. The tree was a faithful projection of the graph. And it was
confusing as hell.

Users saw this:

```
Material
└── Transform
    └── Sphere
```

and read it as "a Material that contains a Transform that contains a Sphere."
Which is technically what the evaluation order is. But nobody thinks that way.
People think: *I made a sphere, then I moved it, then I painted it.* The thing
you created is the identity. The operations are details that came after.

The fix wasn't touching the data structure at all. The backward walk stayed,
tests and all. I added a presentation transform that re-orients each chain:
follow the primary input from the final operation down to the source, then flip
it. The source shape becomes the title row. The operations list below it,
top-down, in the order they were applied:

```
Sphere
    Transform
    Material
```

This is what a modifier stack in any mature 3D tool looks like, and there's a
reason every one of them converged on it. Operations that combine several
inputs (a boolean, a blend) keep real tree structure — the second input nests
under the operation as its own little stack. Linear chains flatten. Identity
first, history below.

Two things I want to keep from this.

**Correct data can still be a wrong UI.** The graph's direction is an
implementation fact. The user's mental model has its own direction, and when
the two disagree, the rendering layer has to do the flip. Don't restructure
your data to match the UI and don't ship the UI in data order. Keep both, with
a pure transform between them. Mine is one function with its own tests; the
graph code never changed.

**Screenshots make UI bugs debuggable.** I iterated on this with a loop:
screenshot the panel, send it to a vision model with a neutral prompt
("describe how this hierarchy reads, list problems, rate clarity"), fix the top
complaint, repeat. Neutral matters — ask "is the tree still confusing?" and a
model will happily confirm whatever you implied. The model caught things I had
stopped seeing: labels truncated by invisible-but-space-reserving buttons,
three identical names that made rows impossible to map to the canvas, property
rows visually indistinguishable from object rows. Each round was one cheap
call. The score plateaued exactly where the remaining complaints stopped being
bugs and started being design *decisions* — which is itself useful: that's the
line where you stop fixing and start choosing.

The takeaway: when a hierarchy view feels wrong but the data checks out, check
the orientation before anything else. Trees are read top-down, thing-first.
If your renderer walks the data the other way, flip it at the view layer and
leave the data alone.
