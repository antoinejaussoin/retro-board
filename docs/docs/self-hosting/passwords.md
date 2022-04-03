---
sidebar_position: 7
---

# 🔑 Passwords

If you followed the [installation instructions](quick-start), you will have noticed the following paragraph:

:::danger Passwords

Once you have run your docker-compose file for the first time, some of
the passwords will be set in stone. Please refrain from changing them
going forward, or if you must, read the
[following guide](passwords).
:::

If you still want to go ahead with changing the passwords, this is still possible but with a bit of work.

## Changing PGAdmin credentials

On `docker-compose.yml`, you can set `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` to create the account that you need to use to log in into it.

The problem is once the container has been run once, these credentials are "baked in", and changing them later won't actually do anything.

If you want to change the credentials anyway, you can follow these steps:

- Stop everything: `docker-compose down`.
- List all docker volumes: `docker volume ls`
- Find the one that looks like `something_pgadmin` (`something` usually being the name of the folder in which your `docker-compose.yml` file is located. So if your docker-compose file is within a folder called `retro`, the volume should be called `retro_pgadmin`).
- Now that you have the full name of the volume, do `docker volume rm retro_pgadmin` (replace _retro_pgadmin_ with the actual name from the previous step).

:::tip Got an error?
If the previous step gave you an error (`Error response from daemon: remove retro_pgadmin: volume is in use - [aa1c695844f618d4828dda7d6a485bdd1e24d27c708069196548be62127fad34]` for instance), note the ID of the container using the volume (the long string at the end of the error, here starting with `aa1c...`), then do `docker rm aa1c695844f618d4828dda7d6a485bdd1e24d27c708069196548be62127fad34` (replace with the correct ID), then finally do `docker volume rm retro_pgadmin` again.
:::

- You can now restart everything (`docker-compose up -d`). PGAdmin will need to be reconfigured (you will need to re-add your server). Follow [these instructions](pgadmin.md).

## Changing the database (Postgres) password

This one is trickier and a bit more involved.

- First, make sure you have a backup of your data. Please refer to [this guide](backup.md) to create a backup.
- Stop everything (`docker-compose down`)
- Delete all containers and volume (**this will delete the postgres database!**): `docker system prune --all` and `docker volume prune`.
- At this point, your database is gone. You still have your backup, right? 😅
- Modify your `docker-compose.yml` file to set your new password(s).
- Run everything (`docker-compose up`). Wait until everything has started.
- At this point, a new (and empty) database should have been created, with the new password. Please check that everything is working fine on the UI (which at this point doesn't have your data).
- **Stop** the **backend** and **frontend** (but keep the rest): `docker-compose stop backend && docker-compose stop frontend`.
- **Open your backup file with a text editor**, and **remove the lines where the postgres user is dropped and re-created** (with the old password). If you don't do that, it will restore with your old password. The lines are near the top (around line 20 to 32) and look like:

```sql
-- REMOVE THE FOLLOWING LINES FROM YOUR BACKUP FILE

--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'blahblahblah';
```

- Restore your backup, by following [this guide](backup.md).
- Start everything up again (`docker-compose up -d`).
- You will also need to [re-configure PGAdmin](pgadmin.md).
