---
sidebar_position: 3
---

# 💾 Backup your data

Making sure your data is safe is **important**.

This will help you making sure your data is backed up.

## Backup

### Get the container ID

On the machine Retrospected is running, do:

```shell
docker ps
```

This should return a list of containers running, looking like this:

```shell
CONTAINER ID   IMAGE                                         COMMAND                  CREATED         STATUS       PORTS                                                                                      NAMES
6556474a1b19   retrospected/frontend:latest                  "/frontend-entrypoin…"   2 days ago      Up 2 days    0.0.0.0:3000->80/tcp, :::3000->80/tcp                                                      prod_frontend_1
beb4fa7d3bd3   retrospected/backend:latest                   "docker-entrypoint.s…"   2 days ago      Up 2 days                                                                                               prod_backend_1
223f6cd73aaf   redis:latest                                  "docker-entrypoint.s…"   6 days ago      Up 6 days    6379/tcp                                                                                   beta_redis_1
6aa8d4e70ed0   dpage/pgadmin4:latest                         "/entrypoint.sh"         2 weeks ago     Up 2 weeks   80/tcp, 443/tcp, 0.0.0.0:3001->3001/tcp, :::3001->3001/tcp                                 prod_pgadmin_1
dc629da8fb41   postgres:11.6                                 "docker-entrypoint.s…"   7 months ago    Up 4 weeks   5432/tcp                                                                                   prod_postgres_1
```

Look for the "postgres" image, and note its container ID (`dc629da8fb41` in our case, but yours will be different).

### Execute the backup

Now that you have the container ID (see above), run the following:

```shell
docker exec -t <docker_container_id> pg_dumpall -c -U postgres > dump.sql
```

This will have created a `dump.sql` file in your current directory. This is your backup file. Keep it safe!

## Restore

### Get the container ID

Follow the same instructions as above (in the Backup section).

### Restore the data

Assuming your backup file is named `dump.sql`, run the following command to restore your data:

```shell
cat dump.sql | docker exec -i <docker_container_id> psql -U postgres
```

## Automate (Optional)

Backing your data up is good, but making it automatic is essential.

You will want to create a cron job to run a backup daily.

### Create a Cron task

First, we need to create a file that will be executed by cron on a daily basis.

```shell
cd /etc/cron.daily
sudo vim backup
```

:::tip Vim?
Vim is a Linux command-line text editor. Feel free to use another one (nano, vi). The point is that we want to create and edit a file named `backup` in the `cron.daily` directory.
:::

### Add the content

Now that you have your backup file opened, copy/paste the following into the file, and modify it to suit your needs.

```shell
#!/bin/sh

CURRENT_DATE=`date +%Y-%m-%d"_"%H_%M_%S`
BACKUP_DIR="/home/username/backup-staging"
SYNC_DIR="/home/username/backups"

docker exec -t retrospected_postgres_1 pg_dumpall -c -U postgres | gzip > $BACKUP_DIR/database.sql.zip
cp /home/username/retrospected/docker-compose.yml $BACKUP_DIR/docker-compose.yml
cp /etc/cron.daily/backup $BACKUP_DIR/backup-script

tar -zcvf $SYNC_DIR/backup.$CURRENT_DATE.tar.gz $BACKUP_DIR/

setopt rm_star_silent
rm -rf $BACKUP_DIR/*
unsetopt rm_star_silent
```

Some things to look out for:

- Modify `BACKUP_DIR` to a directory that actually exists ("username" must be replaced by your username). This is where the backup is being put together (a temporary directory)
- Modify `SYNC_DIR` in the same way. This is where the backup file (a unique tar.gz file) will land, with a timestamp in the filename. This is this directory that must be synchronised with another machine or the cloud somehow to keep your backups outside of this machine in case of hardware failure. You can use [rsync](https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories) or [Resilio](https://www.resilio.com/individuals/) (which I use).
- Modify `retrospected_postgres_1`: this name will change depending on your circumstances. Run `docker ps` to get the actual name (in the `NAMES` column).
