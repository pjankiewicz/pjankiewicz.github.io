---
title: The 400 that only the visitor saw
date: 2026-09-03
description: Seven people clicked "sign in", one account appeared, and the analytics could not say what happened to the other six. The missing pages were the ones that never loaded the tracker.
publish: true
---

Seven visitors clicked a sign-in button on a webapp one morning. One account showed up in the database. I went looking for the other six.

The analytics had the click for every one of them. Then nothing. No callback page, no error event, no second click. Six sessions that ended at the moment they left for the identity provider. The provider could have shown them a consent screen and they walked away. Or our side could have broken while exchanging the code. From the data those two stories were identical.

## The pages with no tracker on them

The login flow was the usual one. A link to `/api/auth/google`, a redirect to the provider, the provider sends the browser back to `/api/auth/google/callback?code=...`, the backend exchanges the code, mints a session and redirects to `/auth/callback` in the app, which loads the tracker and records the sign-in.

Every step on the happy path landed on a page that could be measured. I had never listed the unhappy ones.

If the exchange failed, the backend handler returned a JSON body with a 500. A raw `{"error": "..."}` in the browser, no stylesheet, no script, no link back. Fine for an API. This was a page a person was looking at.

The second one was worse, and I only found it by trying to cancel. If you press Cancel on the provider's screen, it still sends the browser back to your callback, with `error=access_denied` and no `code`. My handler declared `code` as a required query parameter. The framework rejected the request before my code ran. The visitor got a plain-text 400: "missing field `code`". Nobody had written that page. The framework wrote it, and it was the page every person who changed their mind ended up on.

Neither page loaded the analytics script. The only trace of either was a log line on the server, and the host keeps about a hundred of those. So the funnel had a hole at exactly the step where the answer lived, and it had been there since the flow was written.

It's the scoresheet problem from chess. You can replay a game from the moves that were written down. The one move that wasn't recorded is the one you argue about afterwards, and there is nothing to argue from.

## Cancel is not an error

Once I saw it, the fix was small. The callback query type got an optional `code` and an `error`. Every exit of the handler, the cancel included, became a redirect to the app's own callback page with a reason in the query: `provider_denied`, `exchange_failed`, `profile_failed`, and so on. The page fires one analytics event with that reason and the provider the person came through, then shows the sign-in buttons again, with the one they just used at the top.

One detail I would have got wrong a year ago: someone who pressed Cancel did not fail. They should not get a red icon and "authentication failed". They get the heading and the buttons and nothing else. The visitor who hit a real failure gets the icon and the apology. The event distinguishes them so the funnel can too.

Two smaller things came out of the same walk. The HTTP client used for the token exchange had no timeout, so a slow provider would have left the visitor on a blank page for as long as their browser was willing to wait. And native app clients were reading the old JSON error, so they keep getting it. A redirect shape the old binary has never seen is its own kind of dead end.

## What I check now

For any endpoint that ends in a redirect, I write down every response it can produce, including the ones the framework produces for me when a parameter is missing. Each one is either a redirect to a page I own, with a reason I can query, or it is a hole in the funnel.

The cancel path is the first one to check, because you don't write it. The provider sends it, the parser rejects it, and the only person who ever sees the result is the one who just decided not to sign up.
