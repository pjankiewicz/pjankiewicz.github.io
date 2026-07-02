---
title: "Your release build has never run"
date: 2026-07-02
description: "Debug builds run a thousand times before shipping. The release build often runs zero times. That asymmetry is where launch bugs hide."
publish: true
---

Today I watched a store submission almost go out with a login flow that had never once executed on a device.

The app in question had months of development behind it. Thousands of debug-build launches on emulators. A green unit-test suite. CI passing. And a release build that, as far as I can tell, nobody had ever installed anywhere.

When we finally ran it — on an emulator, against the production backend, an hour before pushing the release button — three things fell out.

**First: the release config pointed at a development URL.** The API base URL was set once, in the shared build config, to the emulator's loopback address. Debug builds worked perfectly, because that's the address debug builds are supposed to use. The release build inherited it silently. Every store install would have shipped pointing at a backend that only exists on a developer's laptop. No test catches this, because every test runs in an environment where that address is correct.

**Second: the auth flow had drifted from the backend contract.** The app opened an OAuth route that didn't exist on the server, passed a parameter the server ignored, and waited for a redirect the server would never send. Four separate mismatches. Unit tests were green the whole time — they tested that the app built the URL it intended to build, not that the server agreed with the intention. Contract drift is invisible to any test that only runs on one side of the contract.

**Third, and my favorite: a false alarm that taught a real lesson.** The first screenshot of the "release build" showed a developer login panel — bright orange, labeled DEBUG, sitting in the middle of the store build's login screen. Genuine heart-stop moment. The actual cause: `adb install -r` over an existing debug install fails on signature mismatch, and the launch command then happily starts the *old debug app*. The install error scrolled past unnoticed because it was piped through `tail`. Uninstall first, reinstall, check `versionName` and `pkgFlags` in dumpsys before believing any screenshot.

That last one generalizes further than Android. Twice in the same day, a pipeline like `important-command | tail -5` reported success because the *pipe's* exit code is the last command's — `tail` always succeeds. A deploy wrapper, a test runner, a store upload: all of them can fail invisibly if the thing that reads their exit code is a text filter. If you pipe, check the output for the failure, not the exit code for success.

None of these three bugs was hard to find. Each took about ten minutes of running the actual artifact in an environment that resembled production. What they had in common was that nothing in the normal development loop would ever produce that combination: release configuration, real backend, clean device.

The math here is lopsided. A debug build gets launched hundreds or thousands of times before a release. The release build — different config, different signing, different code paths through minification — often gets launched exactly zero times before users get it. Whatever your equivalent of "install the release artifact on a clean machine and log in against production" is, it costs minutes. Store review round-trips cost days each, and a launch-day login failure costs users you never see again.

Run the thing you're shipping, not the thing you've been developing. They are not the same program.
