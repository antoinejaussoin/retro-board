# Troubleshooting

## Logs

Instead of running your containers using `docker-compose up -d`, use `docker-compose up` which will display all the logs in real-time. This will help you determine the cause(s) of your issue(s).

## Reset everything

You broke something and can't fix it? It happens. Follow the following to reset all docker containers and volumes to their "factory settings":

:::danger
The following will delete docker volumes, a.k.a your data, and more precisely your database data and PGAdmin settings.

If your data is actually important, please make a [backup](backup) first.
:::

- Stop your containers (`docker-compose down` in the folder where the docker-compose file is)
- Delete all stopped containers: `docker system prune --all`
- Delete all orphaned volumes: `docker volume prune`
- Start everything up again: `docker-compose up`.
