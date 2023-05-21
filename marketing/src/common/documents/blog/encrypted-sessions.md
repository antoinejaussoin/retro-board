---
slug: 'encrypted-sessions'
lang: 'en'
title: 'Encrypted Sessions'
subtitle: 'What are encrypted sessions, and why should you use them?'
author: 'Antoine Jaussoin'
date: '2023-03-03'
keywords: 'blog,example'
cover: '/assets/blog/encrypted-sessions/card.png'
---

Why should you use encrypted sessions? Because you want to keep your data private, and have it stored in a way that even Retrospected can't read. 
# Starting an encrypted session

On the homepage, click on "Encrypted Session" (instead of "Create a new session"):

![Create Encrypted Session](/assets/blog/encrypted-sessions/button.png,270x124)


# Overview

Your data (post content, action, and game title) is **encrypted** and **decrypted** **locally**, in your browser.

Only the encrypted text is sent to the server, so the server never sees the clear-text data.

This is how it looks on the database:

![Database view](/assets/blog/encrypted-sessions/db.png,1394x214)

The key is stored in the URL, after the hash sign (#), and is never sent to the server either ([why](https://stackoverflow.com/questions/3664257/why-is-the-hash-part-of-the-url-not-available-on-the-server-side)).

You can then share the URL via a secure mean (email, Slack...), store it in a bookmark etc., but the encryption key will never be sent to Retrospected.

# Anatomy of a URL

<span style="color: blue">https://www.retrospected.com/game/<wbr />P2NWCVKNJ</span><wbr /><span style="color: green">#</span><span style="color: red">pZ0ipXFBn</span>

The <span style="color: blue">blue</span> part contains the Session ID, while the <span style="color: red">red</span> part,
after the <span style="color: green">#</span>, is the encryption key.

In the example above, only the <span style="color: blue">blue</span> part of the URL is sent to the server, never the <span style="color: red">red</span> ([source](https://stackoverflow.com/questions/3664257/why-is-the-hash-part-of-the-url-not-available-on-the-server-side)).

# Encryption

Your content is encrypted locally using AES, with [crypto-js/aes](https://cryptojs.gitbook.io/docs/#ciphers).

# Decryption

The content is decrypted locally, and the key is obtained from one of these sources:

- The URL if the URL contains the encryption key
- Your browser [local storage](https://en.wikipedia.org/wiki/Web_storage)
- A prompt from the app if the key is neither in the URL nor the local storage.

Why is it stored in local storage? For convenience: if you open an existing session from the list of sessions you participated in, in the home page,
the key wouldn't be part of the URL because that list is coming from the Retrospected servers, where the encryption keys are not stored.

When is it stored in local storage? Whenever you open a session with an encryption key in the URL,
the key will be stored in local storage for the reason explained above.
