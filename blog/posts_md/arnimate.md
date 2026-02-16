---
title: "Arnimate: A 2D Animation Editor Built in Rust"
date: "2026-02-16"
description: "Announcing Arnimate, a 2D vector animation editor built with Rust, wgpu, and egui. Think Adobe Animate, but native, GPU-accelerated, and free to use in your browser via WebAssembly."
publish: true
tags:
  - rust
  - animation
  - programming
---

### TL;DR

I'm building Arnimate, a 2D vector animation editor in Rust. It's GPU-accelerated via wgpu, runs on desktop and web, and aims to fill the gap left by Adobe Animate's slow decline. The web version is free to use.

**[Try the live demo](https://pjankiewicz.github.io/arnimate/)** (Chrome/Edge only — requires WebGPU).

### Why Build Another Animation Editor?

Adobe Animate is effectively in maintenance mode. Rive and Lottie tools are great for motion graphics, but they're not full animation editors — you can't do frame-by-frame character animation in them. There's a real gap in the market for a proper 2D animation tool that's modern and fast.

Arnimate is my attempt at filling that gap. It's a full-featured 2D vector animation editor with:

- **Frame-by-frame animation** with onion skinning
- **47 animatable properties** — position, rotation, scale, opacity, colors, path morph, effects, and more
- **GPU-accelerated rendering** via wgpu with custom WGSL shaders
- **Visual effects** — Gaussian blur, glow, drop shadow, all rendered on the GPU
- **Bezier path editing** with a pen tool, pencil tool, and shape tools
- **Lottie export** for web/mobile deployment
- **Audio support** — import audio tracks and sync animation to sound
- **Full undo/redo** via a command pattern history system

### Architecture

The stack is Rust all the way down:

- **wgpu** for GPU rendering — custom pipelines for fills (Loop-Blinn curve rendering), strokes, text, blur (separable Gaussian, multi-pass), and compositing
- **egui** for the UI — immediate-mode GUI that runs on desktop and compiles to WebAssembly
- **Generational arena** scene graph — stable node references that survive deletions, with parent/child relationships and per-node animation data
- **Custom math library** — 2D primitives ported from kurbo (bezier paths, affine transforms, hit testing, triangulation)

The rendering pipeline runs per frame: evaluate animation keyframes → traverse scene graph → tessellate paths → upload to GPU → render fill/stroke/text → apply effects (shadow → glow → blur) → composite layers → blit to screen.

Effects are particularly interesting — each one (blur, glow, shadow) is a separate GPU pipeline using `egui_wgpu` paint callbacks. The Gaussian blur is separable (horizontal then vertical pass) with multi-pass support for large radii, where sigma composes in quadrature: `σ_per_pass = target_σ / √passes`.

### WebAssembly

The whole editor compiles to WebAssembly and runs in the browser via WebGPU. The wasm binary is about 7 MB — not small, but reasonable for a full animation editor with GPU shaders. It's the same codebase as the desktop version, with platform abstraction for file I/O and audio.

WebGPU support is still limited to Chrome and Edge, but it's the future of GPU on the web. Safari and Firefox support is coming.

### What's Next

Arnimate is still in active development. The core animation engine and rendering pipeline are solid, but there's a lot of polish work ahead — better tool UX, more export formats, skeletal animation/rigging, and community features. The web version is and will remain free to use.
