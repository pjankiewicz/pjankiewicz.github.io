---
title: "Capabilities you can't call beat capabilities you're told not to use"
date: 2026-06-03
description: "Sandboxing user scripts? Don't gate the dangerous functions with flags. Build a second environment where they don't exist."
publish: true
---

I was adding user-authored widgets to a webapp this week. Little sandboxed scripts with an Elm-ish shape: `update` changes state, `view` renders it. The rule was simple: `update` may call external APIs, `view` must not — because `view` re-runs every time someone reopens a page, and you really don't want a render to fire off CRM calls or LLM requests as a side effect of scrolling back through history.

My first instinct was the classic one: one sandbox, one flag. Register all the API bindings, set `phase = "render"` before calling `view`, and have every binding check the flag and throw.

I've written that code before. It always rots the same way. Someone adds a new binding and forgets the check. Someone adds a second entry point that doesn't set the flag. The flag becomes load-bearing in fourteen places, and the only thing standing between "render" and "send an email" is a boolean that everyone has to remember exists.

The better move costs almost nothing: **two environments instead of one flag**. Run `update` in a VM where the API bindings are registered. Then throw that VM away, spin up a fresh one where the bindings were *never registered*, and run `view` there. The only thing that crosses the boundary is plain data — the serialized state.

Now the security property is structural. `view` can't call the API for the same reason your toaster can't browse the web: the capability isn't gated, it's absent. A new binding added next year is safe by default, because nobody registers it in the render VM unless they make that decision deliberately. There is no flag to forget.

People worry about the cost of the second VM. Measure it before you do. A scripting VM that loads a small module is microseconds-to-milliseconds territory — and you're already paying network round-trips on the same path. I'll trade a millisecond for deleting an entire class of "forgot the check" bugs every time.

It's the chess version of prophylaxis: don't defend the square, remove the piece that attacks it. Whitelists over blocklists, absence over enforcement.

The takeaway generalizes past sandboxes. Anywhere you find yourself writing `if (mode == X) throw`, ask whether you could instead build the X-mode context so the forbidden thing isn't reachable at all. A check is a promise you have to keep in every future commit. An absence keeps itself.
