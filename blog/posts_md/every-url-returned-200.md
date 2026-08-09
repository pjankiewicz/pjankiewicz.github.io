---
title: "Every URL returned 200"
date: 2026-08-09
description: "A server that answers OK to a page that does not exist, and four other bugs that were invisible because success and silence look identical."
publish: true
---

I typed a URL that could not possibly exist into a site I maintain. A page name I made up on the spot, nonsense, no chance of a match.

`200 OK`.

Not a 404 page returned with a 200 — an actual copy of the homepage, complete with the homepage's `<link rel="canonical">`. Every typo anyone had ever made, every stale inbound link from a decade-old forum post, every crawler probing for `/wp-admin` — all of them had been receiving a cheerful, confident *yes, this page exists, here it is* for months.

The fix took twenty minutes. Finding it took an accident.

## How a server ends up lying this thoroughly

Nobody wrote `return 200 for everything`. It arrived through two reasonable decisions.

Single-page apps need a catch-all. The server can't know that `/settings` is a real screen, because that route lives in JavaScript that hasn't run yet. So the convention is: if no file matches, serve the app shell and let the client sort it out.

The obvious implementation returns 404 with the shell body, because from the server's point of view nothing matched. That breaks immediately — `/settings` is real, and now it 404s. Uptime checks fire. Someone fixes it by forcing 200 on the catch-all.

That fix is correct for `/settings` and wrong for `/nonsense`, and the second half is invisible. Nobody visits `/nonsense`. No test asserts a status code for a URL that doesn't exist, because why would you write that test? The bug's entire surface area is URLs nobody intends to request — which is exactly the population that crawlers generate infinitely.

Both answers were blanket answers. The catch-all receives two different kinds of request — a client-routed screen, and a URL that isn't anything — and it was answering both the same way, twice, in opposite directions.

## The part that generalises

I found four more problems in the same afternoon, and they rhyme.

A sitemap had grown to 27.5 MB because every page carried a block of alternate-language links, and there were a lot of languages. It parsed. It validated. The search console said "temporary processing error" and moved on, and a sitemap that never gets processed is indistinguishable from a site that has no pages.

Two links on every single page of the site pointed at paths the robots file disallowed. One of them was behind a login wall — it had been sending anonymous visitors and crawlers to a sign-in page from the footer of thousands of public pages.

A machine-readable index file for language models contained a list of resources written as `- Name: https://example.com/thing`. An automated audit scored it zero: *"File does not appear to contain any links."* The format wants `[Name](url)`. What I had was prose that happened to contain a URL. The file's entire purpose is to be a list of links, and it contained none.

None of these were caught by the test suite, and the test suite is not bad — it's 1,575 tests and they pass. They didn't catch these because **none of these bugs live in a module.** They live in a status code, in a file size, in an attribute on an anchor tag, in the difference between a URL and a link. They exist in the built output, or in the shape of a response, and code-level tests never look there.

## Write the check. Then break it.

So I wrote checks. One reads every generated page and fails on a page with no content or a followed link to a disallowed path. One compares the server's list of known routes against the router's, because a route missing from the server list would make a real screen return 404 *while still rendering perfectly* — invisible in a browser, catastrophic in an index.

Then I did the thing I want to argue for, which is: I broke each check on purpose and confirmed it screamed.

I re-added the bad link. Failed, correctly. I stripped one `nofollow`. Failed. I emptied one page. Failed. Then I renamed the constant the checker parses its rules out of — simulating someone innocently refactoring a variable name six months from now.

That one mattered. Without a guard, that check would have parsed zero rules, found zero violations, and printed a clean, green, reassuring **"no problems found."** Forever. It would have kept passing through every future regression, and it would have looked exactly like success.

A check that cannot fail is not a check. It's a decoration that produces false confidence, and it is strictly worse than no check at all, because no check at least leaves you appropriately nervous.

So now it refuses. If the parse comes back empty, it exits non-zero with *"parsed 0 rules. Refusing to report a clean run."* An instrument that can't measure must say so, loudly. Silence has to mean *nothing is wrong*, never *I stopped looking*.

## Boot the thing

One more, because it's my favourite.

I restructured that giant sitemap into a set of smaller files served from a parameterised route. Unit tests: green. Every generator function tested, output verified, URL set diffed against production byte for byte — identical.

Then I started the server and it panicked on the first line.

The router doesn't allow a parameter in the middle of a path segment. `/sitemap-{name}.xml` is illegal; the parameter has to be its own segment. This isn't a subtle failure — the process refuses to boot. But it lives in the routing table's construction, and no test that calls a function will ever construct the routing table.

I'd have shipped a server that could not start, with a fully green test suite, if I hadn't run it for an unrelated reason.

That's the whole lesson, really. Test your functions, absolutely. But also: start the process. Fetch the URL. Read the byte count. Look at the status code, not the body. A surprising share of production bugs live in the gap between "my code is correct" and "the thing I deployed does what I think" — and the only instrument that spans that gap is actually running it and looking.

Especially at the things that are supposed to be fine. `200 OK` is the most reassuring string in computing, and for months it was the sound of my server confidently making things up.
