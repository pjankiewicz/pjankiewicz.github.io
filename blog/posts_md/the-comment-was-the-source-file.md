---
title: The comment was the source file
date: 2026-09-02
description: A lookup table's doc comment got the arithmetic wrong. The code under it was right. Forty-five translations copied the comment.
publish: true
---

I asked an agent to build a reference-table page from a lookup table that already existed in a calculator. The table maps "reps to failure" to a percentage of your one-rep max. Above it sat a doc comment explaining how to read it, with a worked example: three reps at RPE 10, four at RPE 9 and five at RPE 8 are "all four reps from failure", so all three sit at the same percentage.

My brief to the agent quoted that example as the test anchor. Pin those three cells, I said, they should all read 92.2.

The agent came back with a different answer. The code indexes the table by reps plus reps-in-reserve. Three at RPE 10 is three from failure. Four at RPE 9 is five from failure. Five at RPE 8 is seven. Those are three different cells, 92.2, 86.3 and 81.1. The published chart agrees with the code. The comment had the arithmetic wrong, and it had been wrong since the file was written.

That's a small bug. What made it worth writing down is where else it had gone.

## The comment had been shipped

The calculator page above that table had a "how to read this" paragraph in its copy. It used the same example, in the same wrong form. That paragraph had been translated into forty-four languages. Every one of the forty-four repeated the wrong example, some of them with the reasoning spelled out in the local language, so the wrong version read confidently everywhere.

Nobody had transcribed the code. Everyone had transcribed the comment. The copywriter read the comment because it was in English and the table was a list of integers. The translators read the copy. The test suite pinned the code, so the tests were green the whole time, and the code was right the whole time. The one thing that was wrong was the one thing that got copied.

It's the chess version of a blunder on move two: the position on the board is fine, but the note in your head about the position is wrong, and every plan you make from the note inherits it.

## Comments are inputs

I used to think of a doc comment as a courtesy. Something a future reader might glance at. In a codebase where copy gets written from the code, and translations get written from the copy, the comment is upstream of forty-five artifacts. It is a source file, with none of the checks a source file gets.

The fix was cheap once it was seen. Correct the comment, correct the English sentence, put the true diagonal into a test so the wrong version can't come back, and hand the forty-four translations a single sentence to fix. The reviewer reading the leaves found the wrong sentence in every one of them.

## What I do differently now

When a brief cites a worked example, the example has to be checked against the code, not the prose next to it. The agent that caught this did exactly that: it ran the numbers through the function before pinning them, and reported that the brief was wrong rather than making the test match the brief. That is the behaviour I want from an implementer, and it is worth saying so in the brief: if the example I give you disagrees with the code, the code wins, and tell me.

And when a comment carries an example, it gets a test. A number in a comment is a claim. Claims get pinned or they get copied.
