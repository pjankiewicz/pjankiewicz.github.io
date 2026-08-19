---
title: "The Least-Tested State Is the Most Common One"
date: "2026-08-19"
description: "A conversion widget shipped invisible because every test ran as a returning user. The fresh visitor — cookie banner up, nothing decided — is the state nobody tests and everybody lives in."
publish: true
---

I shipped a conversion widget today that was invisible to every person it was built for. All tests green. Typecheck clean. 1,600+ unit tests passing, including nine written specifically for the new widget.

The widget was a small proactive card in the bottom-right corner of a webapp — the kind that slides up and offers help after you interact with the page. Classic pattern. The unit tests covered the timing, the dismissal, the analytics events, the session budget. All of it worked.

Then I opened a real browser, loaded the page like a first-time visitor, and clicked the card.

Nothing. The click landed on the cookie consent banner instead.

## Two toasts, one corner

The consent banner lives in the bottom-right corner at `z-index: 1000`. My widget's container was at `z-index: 60`. Both are `position: fixed`. The banner sat on top, and because it's semi-transparent-adjacent in layout terms — a card floating over a card — the widget underneath was partially visible but completely unclickable. Close enough to looking correct that a screenshot in passing wouldn't flag it.

Here's the part that hurt more. While fixing the stacking, I realized the collision wasn't new. The chat panel that the widget opens — a feature that had been in production for weeks — had the same z-index. On mobile, that panel goes fullscreen, and the consent banner floated *on top of its text input*. Any first-time visitor who opened the chat on a phone without first answering the cookie question got a chat they could read but not comfortably type into.

Weeks. In production. On the single most important surface for converting new visitors.

## Why no test caught it

Unit tests run in jsdom. jsdom doesn't do layout. Two elements can occupy the same pixels at conflicting z-indexes and every assertion about them passes, because assertions ask about the DOM tree, not the picture. `getByRole` finds the button; it doesn't know the button is under another button.

But the deeper failure isn't the tooling. It's the state I was testing in.

Every manual check I'd ever done on that corner of the app ran in my own browser profile: cookies decided long ago, banner long gone, logged in half the time. The automated browser tests? They dismiss the consent banner in setup, first thing, precisely because it "gets in the way." Which is the bug, stated as a test convenience.

Think about what that means for the population of states. A returning developer sees the banner for two seconds, once. A first-time visitor — the person every landing page, every signup flow, every conversion widget is aimed at — sees it on *every page* until they deal with it. The state I tested least was the state my target audience is in most.

It's a sampling bias, the same one that ruins ML models. My test distribution was "me, yesterday, again." The production distribution was "stranger, first visit, banner up." The overlap was close to zero exactly where it mattered.

## The fix, and the rule

The mechanical fix took ten minutes: raise the widget's layer above the banner, and while the teaser card is showing, measure the banner's height and stack the card above it with a small gap, settling back down when the visitor finally clicks accept or decline. One `data-` attribute on the banner as a measuring hook, one cheap re-measure loop.

The rule I actually took away has nothing to do with z-index:

**Walk through your feature in the state a stranger arrives in.** Fresh profile, nothing in storage, nothing consented, not logged in. In practice that's one incognito window and thirty seconds. If your app has a consent banner, that banner is part of your first-visit UI whether you designed for it or not — it will sit in some corner, and sooner or later you will put something important in that corner too.

And when two fixed-position elements want the same corner, don't resolve it by whoever happens to have the bigger z-index. That's not a policy, it's an accident with a winner. Decide the stacking on purpose, write the number down next to the other numbers, and make the elements aware of each other if they can be visible at the same time.

A grep for `z-index` across the codebase took five seconds and showed me six layers nobody had ever reconciled. That grep is now part of how I review any floating UI. The picture your users see is a real output of your program — test at least one frame of it with their eyes, not yours.
