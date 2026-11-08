---
slug: 'release-6.0.0'
lang: 'en'
title: 'Retrospected 6.0.0'
subtitle: "A new backend, a new board, and an AI coach that can summarise your retrospective"
author: 'Antoine Jaussoin'
date: '2026-11-08'
keywords: 'blog,release,6.0.0,rust,claude,emoji,reactions,self-hosting,mailjet'
cover: '/assets/blog/release-600/board.png'
---

Retrospected 6.0.0 is out, and it's the biggest release so far. Almost everything has been rebuilt: the interface has been redesigned from scratch, the agile coach now uses Claude, and the backend has been rewritten in Rust.

Despite all that, upgrading should be painless. Your account and your retrospectives are still there, and if you self-host, the new server will pick up your existing database without any manual migration.

# A new board

You spend most of a retrospective looking at the board, so that's where the change is most visible. Every page (home, the board, chat, the summary, your account and the admin panel) has been redesigned, and the app has moved from Material UI to Tailwind CSS and Radix. It also has a new typeface, Plus Jakarta Sans.

We've kept the layout familiar, though: columns, votes, the timer and the private session controls are all where you'd expect them to be.

![The retrospective board in Retrospected 6.0](/assets/blog/release-600/board.png,1440x900)

If you run a self-hosted instance with your own colours, header and logo, none of that is lost. Your branding carries over to the new design, and everyone else gets the same purple as before.

# Emoji reactions

Alongside votes, you can now react to a card with an emoji. Click the smiley on a card, pick an emoji, and everyone in the session will see it straight away. Click it again to remove it.

Reactions are enabled by default, including on your existing sessions and templates. If you'd rather not have them, a moderator can turn them off in the session options. As you'd expect, you can't react to anything once the board is locked.

![Picking an emoji reaction on a card](/assets/blog/release-600/reactions.png,1440x900)

Reactions are also counted next to the votes on the summary, and they're included when you copy it.

This feature was suggested by a user, so 👏 thanks to [@mbinder-wmf](https://github.com/mbinder-wmf) for the idea.

# The AI coach now uses Claude, and can summarise your retrospective

The agile coach has switched from ChatGPT to Claude, via the Anthropic API. There's nothing to do on the hosted app. If you self-host, you'll need to set `ANTHROPIC_API_KEY`, and optionally `ANTHROPIC_MODEL` (it defaults to `claude-haiku-5-5`).

The summary page also has a new **Summarise with AI** button, which asks Claude to write a short Markdown summary of the board. The summary is saved with the session, so it won't disappear when you refresh the page, and it's included when you copy the summary as Markdown or rich text. You can edit it afterwards, and editing doesn't count against your AI allowance. If the board changes after the summary was generated, we keep your text but flag it as out of date, and you can regenerate it whenever you like.

There are a few deliberate restrictions. The button is only available to logged-in users (not anonymous ones), and only on unencrypted boards. It's also disabled while cards are still blurred, so the AI can't read anything the team hasn't revealed yet. And the board content is always loaded by the server, never sent from your browser.

Here's the summary page, with votes and reactions counted alongside each card:

![Summary mode, with votes and a reaction](/assets/blog/release-600/summary.png,1440x900)


# Encrypted sessions over plain HTTP

New cards in encrypted sessions are now encrypted with AES-GCM, and they decrypt the same way whether the page is served over HTTPS or plain HTTP. That's mostly good news for self-hosted instances that don't have a certificate set up yet, where encryption used to be a problem.

Cards encrypted with the old format can still be read, so your existing encrypted sessions won't suddenly appear empty. As before, the encryption key lives in the URL fragment and is never sent to the server.

# The server is now written in Rust

The backend used to be a Node.js app built on Express, TypeORM and Passport. It's now a single Rust binary.

From the outside, very little has changed. The HTTP API, the Socket.IO events and the Redis session cookies are all the same, and the new server runs the same database migrations, so it can start straight from a database created by the old one. If you self-host with Docker Compose, your setup will look very familiar: Postgres, Redis, the same OAuth providers, Stripe, licences and the admin panel.

If you run more than one backend instance, nothing changes there either: with Redis enabled for Socket.IO, a card posted on one instance still shows up for users connected to another.

There are, however, two configuration changes to be aware of:

- Verification and password reset emails are now sent through [Mailjet](https://www.mailjet.com/) instead of SendGrid. You'll need to set `MAILJET_API_KEY`, `MAILJET_SECRET_KEY` and `MAILJET_SENDER`, and the sender address must be validated in your Mailjet account. SMTP still works as before, and is used whenever Mailjet isn't configured.
- As mentioned above, the AI coach now needs `ANTHROPIC_API_KEY`. The monthly allowances are set with `AI_FREE_LIMIT` and `AI_PAID_LIMIT` (5 and 1000 by default). The old `OPEN_AI_FREE_LIMIT` and `OPEN_AI_PAID_LIMIT` variables are still honoured if the new ones aren't set.

# Everything else

The rest of the stack has been brought up to date too. The frontend now runs on React 19, React Router 7, TypeScript 5.9 and Vite 6. Live board state is managed with Zustand instead of Recoil, and the home, account and subscription pages fetch their data with TanStack Query. The repository has moved from Yarn to npm, the marketing site is on Next.js 15, and the documentation site is on Docusaurus 3.
