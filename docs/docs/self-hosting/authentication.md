---
sidebar_position: 5
---

# 🎫 Authentication

When running a self-hosted instance, you can customise how your users will authenticate to the system.

You essentially have 3 authentication mechanisms:

- OAuth (aka Social) authentication (Google, Okta, GitHub etc.)
- Password accounts (the good old email / password combination)
- Anonymous accounts (where the user cannot retrieve his posts and sessions on a different machine)

By default, OAuth is disabled (because it is not configured), and the other two are enabled.



## OAuth

This is a subject of a [dedicated page here](oauth).

## Password accounts

You have two optional settings for password accounts.

You can disable them entirely, by setting the environment variable `DISABLE_PASSWORD_LOGIN` to `true`.

You can also only disable registration, by setting the environment variable `DISABLE_PASSWORD_REGISTRATION` to `true`.

If you want more details on how to set these environment variables, [read this page](optionals).

If you disabled registration, it means the administrator will need to create the accounts manually, by using the [admin screen](admin).

## Anonymous accounts

If you do not wish your users to use anonymous accounts, and force them to authenticate properly, they can be disabled by setting the environment variable `DISABLE_ANONYMOUS_LOGIN` to `true`.