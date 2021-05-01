# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM --platform=$BUILDPLATFORM node:15-alpine as Node

ENV NODE_ENV=production

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./frontend/package.json ./frontend/
COPY ./common/package.json ./common/

RUN chown -R node:node /home/node/app

USER node

RUN yarn --network-timeout 1000000 install

COPY --chown=node:node ./frontend/src ./frontend/src
COPY --chown=node:node ./frontend/public ./frontend/public
COPY --chown=node:node ./frontend/config-overrides.js ./frontend/config-overrides.js
COPY --chown=node:node ./frontend/tsconfig.json ./frontend/tsconfig.json
COPY --chown=node:node ./frontend/.env ./frontend/.env
COPY --chown=node:node ./common ./common

RUN yarn build-frontend

FROM nginx:alpine

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=3201

COPY --from=Node /home/node/app/frontend/build /usr/share/nginx/html
COPY ./frontend/docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./frontend/docker/frontend-entrypoint.sh /

RUN ["chmod", "+x", "/frontend-entrypoint.sh"]
ENTRYPOINT ["/frontend-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]