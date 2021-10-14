# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM --platform=$BUILDPLATFORM node:16-alpine as Node
## FROM node:16-alpine as Node

ENV NODE_ENV=production

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY ./package.json ./
COPY ./babel.config.js ./
COPY ./docusaurus.config.js ./
COPY ./sidebars.js ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./

RUN chown -R node:node /home/node/app

USER node

RUN yarn --network-timeout 1000000 install

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./blog ./blog
COPY --chown=node:node ./docs ./docs
COPY --chown=node:node ./static ./static

RUN yarn build

FROM nginx:alpine

COPY --from=Node /home/node/app/build /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]