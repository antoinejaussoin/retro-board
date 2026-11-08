---
slug: 'release-6.0.0'
lang: 'en'
title: 'Retrospected 6.0.0'
subtitle: "A new backend, a new board, and a coach that can write the retrospective up"
author: 'Antoine Jaussoin'
date: '2026-11-08'
keywords: 'blog,release,6.0.0,rust,claude,emoji,reactions,self-hosting,mailjet'
cover: '/assets/blog/release-600/board.png'
---

Retrospected 6.0.0 is a new version of the product, not a coat of paint on the previous one. The board has been redrawn, the agile coach now runs on Claude, and the server behind it has been rewritten in Rust. Your accounts, your retrospectives, and a self-hosted database come along. Nothing has to be migrated by hand.

# A new board

The session itself is the part you look at for an hour, so that is where the new version is most obvious. Home, the board, chat, the summary, account, and administration are drawn again, with Tailwind CSS and Radix in place of Material UI. The type is Plus Jakarta Sans. Columns, votes, the timer, and the private-session control are still where you expect them.

![The retrospective board in Retrospected 6.0](/assets/blog/release-600/board.png,1440x900)

White-label colours still apply. A self-hosted instance that sets its own palette, header, and logo keeps them. The default purple is still the default, and a branded install stays branded.

# Emoji reactions

You can now react to a card with an emoji, the same way you already vote on it. Tap the smiley on a card, pick any emoji, and it shows up for everyone in the session. Tap it again to take it back. Reactions are on by default, including on sessions and templates that already exist, and a moderator can turn them off in the session options. They are ignored when the board is locked.

![Picking an emoji reaction on a card](/assets/blog/release-600/reactions.png,1440x900)

The summary counts them next to the votes, and they are included when you copy the summary.

This one came from a request. 👏 Thanks to [@mbinder-wmf](https://github.com/mbinder-wmf) for the idea ([#602](https://github.com/antoinejaussoin/retro-board/issues/602)).

# The coach is Claude, and it can write the retrospective up

The agile coach no longer calls ChatGPT. It uses Claude, through the Anthropic API. On the hosted app that is already wired up. On a self-hosted instance, set `ANTHROPIC_API_KEY`. `ANTHROPIC_MODEL` is optional and defaults to `claude-haiku-5-5`.

There is also a new button on the summary page: **Summarise with AI**. It asks Claude for a short Markdown write-up of the board. The write-up is saved on the session, so it is still there after a refresh, and it is included when you copy the summary as Markdown or rich text. You can edit that Markdown afterwards. Editing does not spend another AI call. If the board changes after the write-up was generated, the saved text stays and is marked out of date, and you can generate it again.

A few limits, on purpose. The summary is only offered to a logged-in, non-anonymous participant, and only on a board that is not encrypted. It is also refused while cards are still blurred, so the model cannot read what the room has not revealed yet. The browser sends the board id. The server loads the board itself.

The summary page, with votes and a reaction counted alongside the cards:

![Summary mode, with votes and a reaction](/assets/blog/release-600/summary.png,1440x900)

# Drag and drop, including on a phone

Reordering cards, moving them between columns, and dropping them into a group still work. The library underneath is now Pragmatic Drag and Drop. The practical change is on a phone: a finger on the drag handle did not start a drag before, because a touch swipe never starts a native HTML drag. It does now.

# Encrypted sessions on plain HTTP

New cards in an encrypted session are sealed with AES-GCM. The same ciphertext opens whether the page is served over HTTPS or over plain HTTP, which matters for a self-hosted instance that has not put a certificate in front of it yet. Cards sealed with the previous format still decrypt, so an existing encrypted session does not go blank. The key is still the fragment of the URL, and it is still never sent to the server.

# The server is now Rust

The backend used to be Node.js, with Express, TypeORM, and Passport. It is now a single Rust binary. The HTTP API, the Socket.IO event names, and the Redis session cookies are the same, and the server still applies the existing database migrations. A database written by the old server starts on the new one. Docker Compose for a self-hosted install keeps the same shape: Postgres, Redis, the same OAuth providers, Stripe, licences, and the admin panel.

When Redis is enabled for Socket.IO, a card written on one backend process reaches people connected to another. That is the same idea as before, so a deployment with more than one backend keeps working.

Two names did change:

- Verification and password-reset email goes through [Mailjet](https://www.mailjet.com/) instead of SendGrid. Set `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, and `MAILJET_SENDER`. The sender address has to be validated in the Mailjet account. SMTP is unchanged, and it is used when Mailjet is not configured.
- The coach key is `ANTHROPIC_API_KEY`, as above. Monthly allowances are `AI_FREE_LIMIT` and `AI_PAID_LIMIT` (5 and 1000 if you leave them unset). The previous `OPEN_AI_FREE_LIMIT` and `OPEN_AI_PAID_LIMIT` names are still read when the new ones are absent.

# Around the app

The frontend is on React 19, React Router 7, TypeScript 5.9, and Vite 6. Live board state has moved from Recoil to Zustand, and the home, account, and subscribe pages load their data with TanStack Query. The repository uses npm rather than Yarn. The marketing site is on Next.js 15, and the documentation site is on Docusaurus 3.
