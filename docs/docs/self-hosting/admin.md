---
sidebar_position: 4
---

# 🙋‍♂️ Managing Users

When self-hosting, you will not have access to the ability to confirm and reset passwords by email (unless you setup [Sendgrid](sendgrid)).

If a user forgets their password, you can access a specific admin tool by accessing `/admin` on your Retrospected frontend, and reset your user's password.

:::tip Admin Only!
Only the admin user set under `SELF_HOSTED_ADMIN` in your `docker-compose.yml` file will be able to access this page.
:::

The admin panel should look like this:

![Retrospected Admin Panel](/img/self-hosting/admin-panel.png)
