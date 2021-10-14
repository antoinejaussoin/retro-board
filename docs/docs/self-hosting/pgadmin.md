---
sidebar_position: 2
---

# 👨🏻‍💼 PGAdmin

[PGAdmin](https://www.pgadmin.org) allows you to have access to your database.

## Connection

Connect to PGAdmin using the port defined in your `docker-compose.yml` file. By default it is 1801.
If on localhost, the URL will then be [http://localhost:1801](http://localhost:1801).

You will then be presented with a login screen:

![PGAdmin Login](/img/self-hosting/pga-login.png)

The username (email) and password are defined in your `docker-compose.yml` file under `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` respectively.

## Adding the database

By default, PGAdmin is not connected to any database. We need to set that up manually.

### Add Server

From the dashoard below, please click on `Add New Server`.

![PGAdmin Dashboard](/img/self-hosting/pga-dashboard.png)

### Connection details

On the first tab, you just need to add a name under "Name". It can be anything.
No need to change anything else.

![PGAdmin](/img/self-hosting/pga-add-general.png)

On the second tab, you need to fill in a few fields:

![PGAdmin](/img/self-hosting/pga-add-connection.png)

- **Host name**: This will always be `postgres`. This is the name of the container as defined in your `docker-compose.yml` file.
- **Port**: This should always be `5432`.
- **Maintenance database**: `postgres` again.
- **Username**: you guessed it, `postgres`. Unless you modified `POSTGRES_USER`, but you shouldn't.
- **Password**: the password defined under `POSTGRES_PASSWORD` and `DB_PASSWORD` in your `docker-compose.yml` file.
- Check the **Save password?** checkbox to make your life easier.

Click `Save`.

### You're good to go

You should now see your server in the list on the left, and you now have the ability to look and modify the data there.

![PGAdmin](/img/self-hosting/pga-done.png)
