# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM node:16-alpine

# App directory
WORKDIR /usr/src

ENV NODE_ENV production

RUN npm i -g yalc

COPY ./package.json ./package.json
COPY ./backend/package.json ./backend/
COPY ./backend/yarn.lock ./backend/
COPY ./backend/tsconfig.json ./backend/
COPY ./common/package.json ./common/
COPY ./common/yarn.lock ./common/
COPY ./common/tsconfig.json ./common/
COPY ./common/src ./common/src

WORKDIR /usr/src/common
RUN yarn --network-timeout 1000000 install
RUN yarn build
RUN yalc publish --private

WORKDIR /usr/src/backend
RUN yalc add @retrospected/common
RUN yarn --network-timeout 1000000 install

WORKDIR /usr/src
COPY ./backend/src ./backend/src
RUN yarn build-backend

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
