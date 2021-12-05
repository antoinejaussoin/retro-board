# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM --platform=$BUILDPLATFORM node:16-alpine as Node

ENV NODE_ENV=production

RUN npm i -g yalc

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY ./yarn.lock ./
COPY ./package.json ./
COPY ./frontend/package.json ./frontend/
COPY ./frontend/yarn.lock ./frontend/
COPY ./common ./common

RUN chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app/common
RUN yarn --network-timeout 1000000 install
RUN yarn build
RUN yalc publish --private
# RUN yarn link
WORKDIR /home/node/app/frontend
RUN yalc add @retrospected/common

RUN yarn --network-timeout 1000000 install
WORKDIR /home/node/app
RUN yarn --network-timeout 1000000 install


COPY --chown=node:node ./frontend/src ./frontend/src
COPY --chown=node:node ./frontend/public ./frontend/public
COPY --chown=node:node ./frontend/tsconfig.json ./frontend/tsconfig.json
COPY --chown=node:node ./frontend/.env ./frontend/.env
COPY --chown=node:node ./common ./common

RUN yarn build-frontend

FROM nginx:alpine

COPY --from=Node /home/node/app/frontend/build /usr/share/nginx/html
COPY ./frontend/docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./frontend/docker/frontend-entrypoint.sh /

RUN ["chmod", "+x", "/frontend-entrypoint.sh"]
ENTRYPOINT ["/frontend-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]