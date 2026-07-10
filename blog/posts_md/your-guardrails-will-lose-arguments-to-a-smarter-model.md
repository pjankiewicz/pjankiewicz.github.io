---
title: Your guardrails will lose arguments to a smarter model
date: 2026-07-10
description: I upgraded an AI product to a stronger model and my hallucination guard started losing debates to it — in front of users. What "smarter" breaks, and how to fix the referee instead of the player.
publish: true
---

I upgraded the main model behind an AI assistant this week. Everything got better — tool use, tone, judgment. And then I read the production transcripts and found the new model doing something the old one never did: arguing with my own guardrails, winning the argument, and leaking the whole debate to the user.

Here's the setup. The assistant answers with tool calls — it reads real data before making claims about it. Behind it sits a small, cheap critic model: after the assistant drafts a reply, the critic checks whether every user-specific number in the draft is backed by an actual tool call. If not, the draft is discarded and the assistant gets an internal note — "your claim isn't grounded, either call the tool or drop the number" — and one retry. The retry streams straight to the user.

This worked fine for months with a mid-tier model. The mid-tier model treated the critique like a instruction from God: it would obediently call the tool, rewrite the reply, done.

The new model read the same critique and said: no, you're wrong. And it was right.

The number the critic flagged had come from the user's own message — the app injects structured context (recent activity, live session data) into the conversation, so the "ungrounded" figure was literally in the input. The critic couldn't see that, because I only ever showed it the draft and the tool-call log. Its verdict was wrong. The old model never noticed. The new model noticed, restated its reply, and then appended a paragraph — in English, to a user writing in another language — explaining to the critic why no tool call was needed and where its numbers came from.

That paragraph streamed to the user. A polished, correct, professional reply, followed by the model visibly defending itself to an invisible referee.

In another turn it went the other way: the model half-accepted the critique and opened its reply with "you're right, I should have checked before answering" — addressed to the user, who had never criticized anything. The user just asked a normal question and got an apology for a draft they never saw.

Sit with the mechanics for a second, because I think this generalizes to every LLM pipeline with an internal feedback channel. My re-ask note told the model what was wrong. It never said what the *output* should be. With the weaker model that was fine, because the weaker model couldn't conceive of disputing the referee — the only move it knew was "comply and rewrite." The output contract was being enforced by the model's limitations, not by my prompt. Upgrade the model, and the unstated contract evaporates. A smarter player will find every move your rules don't forbid — including "correctly explain why the referee is wrong," which is a great move in a debate and a terrible one when the debate transcript ships to production.

It's a bit like backtracking search: the weak model only ever explored the branch you intended. The strong model explores the whole tree you actually defined.

Three fixes, in order of importance:

**Give the referee everything the player saw.** The critic was judging claims about the input without seeing the input. That's not a strictness problem, it's an evidence problem — no prompt tuning fixes a judge that's missing the exhibits. Every grounding source the assistant legitimately has (the user's message, injected context, tool results) must be visible to whatever checks the assistant. My false-positive rate was the direct cost; each false re-ask also burned a full extra call on the expensive model, so the cheap critic was quietly doubling the bill on a third of the turns it touched.

**Pin down the output contract on every injected critique.** The note now says, explicitly: this message is from an automated verifier, not the user; the user never saw your draft and will never see this note; your next message goes verbatim to the user; write only the user-facing reply, in the user's language; do not mention the verifier, the audit, or your tools; and if your claim was actually grounded, keep it and just restate the reply. Every sentence of that exists because the model did the thing it forbids.

**Scrub anyway.** Prompts are policy, not physics. The reply that follows an internal critique now passes through a dumb deterministic filter that drops any paragraph mentioning the verifier or the internal plumbing vocabulary. It will almost never fire. The one time it does, it saves a user from reading my pipeline's internal monologue.

There was a fourth, sillier bug in the same batch, worth a footnote: my "did we silently fall back to a different model" alarm compared model names with string equality, and the new provider resolves model aliases to dated snapshot names with the tokens *in a different order*. Every single call got flagged as a fallback. Same shape of lesson — infrastructure written against the old provider's conventions, silently wrong under the new one.

The takeaway: when you upgrade the model, your guardrails don't automatically upgrade with it — they *degrade*, because half of their reliability was the old model's obedience. Re-read your internal prompts assuming a reader that is smarter than you expected, correct when you're wrong, and unaware of which parts of the conversation are load-bearing theater. Then go read your production transcripts, because that's the only place any of this shows up.
