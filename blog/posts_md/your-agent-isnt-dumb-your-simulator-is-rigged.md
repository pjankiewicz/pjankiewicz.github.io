---
title: "Your agent isn't dumb, your simulator is rigged"
date: 2026-07-08
description: "I spent hours tuning a game bot that kept dying at level one. The bot was fine. The world it lived in was broken in ways that looked exactly like bad play."
publish: true
---

I've been building a bot for a poker-style roguelite. Simulator in Rust, search on top, the usual setup. The bot was terrible. It died on the first level in most runs, and every instinct said: the strategy is weak, tune the strategy.

I almost started there. Instead I traced one single game, action by action, and found something embarrassing: the simulator had a bug where an endgame boss — one that's supposed to be impossible before the midgame — spawned on level one. Every run. The default value of an uninitialized field happened to be the hardest boss in the game.

The bot wasn't weak. It was playing a rigged game.

That was the first of many. Over the next few hours I audited the simulator against the original game's source and found a whole family of bugs, and here's the thing — every single one of them looked exactly like "the bot plays badly":

- A missing income rule (the real game pays you for unused resources every round). The bot's economy was chronically starved. Looks like: "the bot manages money badly."
- Items that could be bought but whose effects were never implemented. The bot bought them, they did nothing. Looks like: "the bot wastes money on junk."
- A difficulty table with two levels 20-40% harder than the real game, exactly where the bot kept dying. Looks like: "the bot can't handle the midgame."
- A shop that offered three times more of a rare resource than the real game. This one inflated the bot's results — a bug in its favor is still a bug, because you end up tuning against a world that doesn't exist.

The pattern generalizes way beyond games. Any time you evaluate an agent — an RL policy, a trading strategy on a backtester, an LLM agent in a mocked environment — the environment is part of the system under test, and it's usually the part nobody tests. Backtest engines with look-ahead leaks. Mock APIs that accept requests the real API rejects. Reward functions that pay out for the wrong thing. The agent gets blamed, retrained, retuned — against a counterfeit world.

What actually worked for me, in order:

1. **Trace one full episode by hand before any tuning.** Not aggregate stats — one game, every action, every state transition. The level-one boss bug was visible in the first thirty lines of a trace. Aggregate win rates hid it completely; they just said "bad."
2. **Audit against ground truth, mechanically.** I had the original game's source. I diffed rule by rule: income, prices, probabilities, timings. Where you don't have source, you have documentation, or the real API, or recorded episodes. Every rule you can't verify is a place your agent can be silently wrong.
3. **Fix the world before the brain.** Tuning a policy against a broken environment doesn't just waste time — it actively bakes the environment's bugs into the policy. My bot had learned (via my hand-tuning) to hoard resources, which was only correct in the world where income didn't exist.

The chess way to say it: before you conclude your engine misevaluates positions, make sure the board isn't missing a piece.

One number to close with. Fixing the simulator bugs — no strategy changes at all — moved the bot from "dies on level one" to clearing the midgame. The single biggest strategy improvement of the whole project was not a strategy improvement.

Next time your agent looks dumb, trace one episode. The bug you find probably won't be in the agent.
