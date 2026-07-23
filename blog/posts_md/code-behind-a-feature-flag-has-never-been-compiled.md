---
title: "Code Behind a Feature Flag Has Never Been Compiled"
date: 2026-07-23
description: "A screenshot function sat in a vendored framework looking finished. The first time any build actually enabled its feature, it failed twice — once at compile time, once at runtime. Dead code at least type-checks. Feature-gated code doesn't even do that."
publish: true
---

I was wiring a screenshot capability into a desktop app. The function already existed in a vendored UI framework — a proper implementation, reading back the GPU framebuffer, returning an image. It sat behind a cargo feature. The code looked done because someone had written it carefully, with comments, following the file's conventions. It compiled, in the sense that the crate compiled.

The first build that actually enabled the feature failed with a type error. The function's signature used `Result<T>` — one generic argument — in a file whose ambient `Result` was the two-argument kind. A one-token bug, the kind the compiler catches instantly. It had survived in the tree because the compiler had never once seen that function. `cfg` doesn't compile your code and throw the result away. It deletes the code before the type checker wakes up.

That was failure one. Failure two was quieter. The feature was declared in the top-level crate and forwarded down to the platform crate that held the real implementation — except the forward went through a dev-dependency. Dev-dependency features don't propagate to downstream consumers. So enabling the feature compiled the public API surface and silently skipped the platform implementation behind it. Everything built. At runtime, the call hit the trait's default method: "not implemented for this platform."

Two bugs, zero compiler warnings, in code that any reviewer would have approved. Both were invisible for one reason: no build configuration anywhere — not the app, not CI, not the framework's own tests — ever turned that feature on.

There's a hierarchy of how dead code can lie to you. Unused code with no gate still gets parsed, type-checked, borrow-checked; the compiler at least confirms it's coherent, and warns you it's unused. Feature-gated code that nothing enables gets none of that. It's not dead code. It's unwritten code wearing dead code's clothes. Schrödinger would recognize the situation: the function is simultaneously correct and broken until some build finally opens the box.

The failure compounds with distance. This code was in a vendored dependency — written in one repo, gated for a consumer that lived in another, tested by neither. The author gated it correctly by their local conventions. The consumer that would have exercised it didn't exist yet. Between those two moments, refactors moved types and renamed imports around the frozen, unchecked function, and nothing ever complained.

What I actually do about it now:

- **Treat first activation as a test.** The first build with a new feature combination is not a formality — expect it to fail, budget for it, and do it as close to writing the code as possible. If you add a gated capability, add one build (a CI job, a Makefile line, anything) that compiles with it on, even if nothing ships it yet.
- **Audit for orphan features.** Grep your feature declarations, then grep for who enables them. A feature no manifest, CI matrix, or downstream crate ever activates is a pile of unchecked syntax. Either wire up a build or delete it.
- **Be suspicious of feature forwards.** A feature that only re-exports another crate's feature is one line — and one line is exactly the size of a bug. Check what kind of dependency edge the forward crosses. A forward through a dev-dependency is a no-op for everyone downstream, and cargo won't say a word.

The general law is older than cargo: a code path's reliability is proportional to how recently something actually executed — or at least compiled — it. Feature flags move code from "checked on every build" to "checked when someone remembers." Someone has to remember. Make it a machine.
