# Bookshelf Cloud Functions

Holds the Anthropic API key and serves Haiku-powered book recommendations to the
app. The key never reaches the browser — the client calls `recommendBooks` via
the Firebase callable-functions SDK.

## One-time setup

Cloud Functions require the Firebase **Blaze** (pay-as-you-go) plan. The free
monthly allowances cover this app's usage many times over; Haiku calls are
fractions of a cent each.

```sh
# from the repo root
firebase login
firebase use bookshelf-anthony

# store the Anthropic key (paste it when prompted)
firebase functions:secrets:set ANTHROPIC_API_KEY

# install deps + deploy
cd functions && npm install && cd ..
firebase deploy --only functions
```

## Updating

After changing `index.js`, redeploy:

```sh
firebase deploy --only functions
```

## What it does

`recommendBooks({ digest, exclude, count })` → `{ recommendations: [{title, author, reason}] }`

- `digest` — plain-text summary of the reader's rated books + reviews (built client-side).
- `exclude` — books to avoid recommending (already read, or already suggested this session).
- `count` — how many suggestions to return (1–8).

Uses `claude-haiku-4-5` with structured outputs so the response is always valid JSON.
