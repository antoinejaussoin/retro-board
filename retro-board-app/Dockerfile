# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM --platform=amd64 node:14-alpine as Node

ENV NODE_ENV=production

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./retro-board-app/package.json ./retro-board-app/
COPY ./retro-board-common/package.json ./retro-board-common/

RUN chown -R node:node /home/node/app

USER node

RUN yarn --network-timeout 1000000 install

COPY --chown=node:node ./retro-board-app/src ./retro-board-app/src
COPY --chown=node:node ./retro-board-app/public ./retro-board-app/public
COPY --chown=node:node ./retro-board-app/config-overrides.js ./retro-board-app/config-overrides.js
COPY --chown=node:node ./retro-board-app/tsconfig.json ./retro-board-app/tsconfig.json
COPY --chown=node:node ./retro-board-app/.env ./retro-board-app/.env
COPY --chown=node:node ./retro-board-common ./retro-board-common

RUN yarn build-ui

FROM nginx:alpine

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=3201

COPY --from=Node /home/node/app/retro-board-app/build /usr/share/nginx/html
COPY ./retro-board-app/docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./retro-board-app/docker/frontend-entrypoint.sh /

RUN ["chmod", "+x", "/frontend-entrypoint.sh"]
ENTRYPOINT ["/frontend-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]