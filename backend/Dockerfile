# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM node:16-alpine

# App directory
WORKDIR /usr/src/backend

ENV NODE_ENV production

COPY ./yarn.lock ./
COPY ./package.json ./
COPY ./backend/package.json ./backend/
COPY ./common/package.json ./common/

RUN yarn --network-timeout 1000000 install

# Delete problematic frontend dependencies
RUN rm -rf ./node_modules/webpack-dev-server
RUN rm -rf ./node_modules/renderkid
RUN rm -rf ./node_modules/mocha
RUN rm -rf ./node_modules/wide-align
RUN rm -rf ./node_modules/yargs-unparser

COPY ./backend ./backend
COPY ./common ./common

RUN yarn build-backend

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
