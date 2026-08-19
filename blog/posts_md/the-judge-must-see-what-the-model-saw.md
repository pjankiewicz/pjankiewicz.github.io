---
title: The judge must see everything the model saw
date: 2026-08-19
description: My eval pipeline filed four hallucination defects in three days. All four were false accusations — the judge was blind to one input stream.
publish: true
---

My automated evaluator accused a production model of fabricating user data four times in three days. Same defect slug, same pattern: the assistant called a computation tool with specific numbers the user "never provided". The evidence looked damning — tool calls quoted verbatim, numbers that appeared nowhere in the conversation. I sat down to clamp the model with a hard guard.

Then I did the arithmetic.

The setup: an assistant embedded on a small calculator page of a webapp. The visitor fills a form, gets a result, and can chat about it. The form inputs plus the result get sent along with each chat request as a context block, so the assistant knows what the visitor computed. The assistant then called a tool with numbers like the visitor's age and body measurements — numbers absent from every chat message. The evaluator flagged them as invented. A mechanical guard I'd built earlier flagged them too: "these values appear nowhere in what the user told you."

Here's what the arithmetic said. The calculator's published result was on the record — the visitor's first message quoted it. When I plugged the "fabricated" tool inputs into the calculator's own formula, out came the visitor's exact result, to one decimal. All four cases, same story. Think about what that means: the probability that a model invents three numbers that happen to reproduce a user's stated result through a nontrivial formula is roughly zero. Those weren't inventions. They were the visitor's actual form entries.

So where did the judges go wrong? The context block was spliced into the system prompt on every request — and never written to storage. The model saw it. The transcript didn't contain it. And every judge I had — the mechanical guard, the LLM evaluator, the human rescore UI, me — reads the transcript, not the wire. Each of us judged a conversation with one input stream amputated, and each of us reached the same wrong verdict with total confidence.

It's like watching a chess game where one player's moves are erased from the scoresheet, then accusing the other player of moving pieces illegally. The position makes no sense — but the defect is in the scoresheet, not the player.

The near-miss is what stays with me. I had a pre-registered decision rule: if the soft warnings kept failing, revert to a hard gate that refuses the tool calls. The evidence for "kept failing" was four occurrences in three days. I was one commit away from shipping refusals against a model that was doing exactly the right thing — reading the numbers the user gave it and using them. The defect rate wasn't measuring the model. It was measuring my storage gaps.

Two rules I now enforce:

**Persistence is part of adding an input stream.** Any context you splice into a model call at request time — retrieved snippets, page state, per-request blocks — gets persisted into the same record your evaluators read, at the same moment. Not for debugging. Because every downstream judgment about the model's honesty silently assumes the record is complete. A transcript that omits an input stream isn't a smaller record; it's a different conversation.

**Recompute before you convict.** When a judge says the model invented a number, run the domain math on the "invented" values first. If they exactly reproduce something the user did state, they were real inputs arriving through a channel your judge can't see. Five minutes of arithmetic beats a week of prompt-engineering a model that was never broken.

The general trap: an eval pipeline is itself a system with inputs, and it fails the same way any system fails — quietly, at the seams. Before trusting a verdict about the model, audit what the judge could see. The most convincing hallucination reports I've ever read were written by judges hallucinating an absence.
