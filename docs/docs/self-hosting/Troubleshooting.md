# 🐛 Troubleshooting

## Logs

Instead of running your containers using `docker-compose up -d`, use `docker-compose up` which will display all the logs in real-time. This will help you determine the cause(s) of your issue(s).

## Migrating images

You are still using `antoinejaussoin/retro-board-frontend` and `antoinejaussoin/retro-board-backend`? You might want to migrate to `retrospected/frontend` and `retrospected/backend` respectively.

Simply update your `docker-compose.yml` file and replace the two images, and restart everything.

The migration will be completely transparent.

:::caution Older versions
The new namespace (`retrospected/*`) only has versions from 4.9.0, plus `latest` and `canary`.
If you are still using an older version, and don't want to update, keep using the old namespace.
:::

## Reset everything

You broke something and can't fix it? It happens. Follow the following to reset all docker containers and volumes to their "factory settings":

:::danger This will deleted everything!
The following will delete docker volumes, a.k.a your data, and more precisely your database data and PGAdmin settings.

If your data is actually important, please make a [backup](backup) first.
:::

- Stop your containers (`docker-compose down` in the folder where the docker-compose file is)
- Delete all stopped containers: `docker system prune --all`
- Delete all orphaned volumes: `docker volume prune`
- Start everything up again: `docker-compose up`.
