# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM --platform=$BUILDPLATFORM node:lts-alpine as Node
#FROM  node:16-alpine as Node

ENV NODE_ENV=production

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN chown -R node:node /home/node/app

USER node

RUN yarn --network-timeout 1000000 install

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./public ./public
COPY --chown=node:node ./tsconfig.json ./tsconfig.json
COPY --chown=node:node ./vite.config.ts ./vite.config.ts
COPY --chown=node:node ./index.html ./index.html
COPY --chown=node:node ./.env ./.env

RUN yarn build

FROM nginx:latest

RUN apt update
RUN apt -y remove libfreetype6
RUN apt -y install jq

COPY --from=Node /home/node/app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./docker/frontend-entrypoint.sh /
COPY ./docker/wpcc.html /

RUN ["chmod", "+x", "/frontend-entrypoint.sh"]
ENTRYPOINT ["/frontend-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]