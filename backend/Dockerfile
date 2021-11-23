# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM node:16-alpine

# App directory
WORKDIR /usr/src/backend

ENV NODE_ENV production

RUN npm i -g yalc

COPY ./yarn.lock ./
COPY ./package.json ./
COPY ./backend/package.json ./backend/
COPY ./backend/yarn.lock ./backend/
COPY ./backend/tsconfig.json ./backend/
COPY ./common ./common

WORKDIR /usr/src/backend/common
RUN yarn --network-timeout 1000000 install
RUN yarn build
RUN yalc publish --private
# RUN yarn link
WORKDIR /usr/src/backend/backend
RUN yalc add @retrospected/common
# COPY ./.yalc ./.yalc
# RUN yarn link @retrospected/common
RUN yarn --network-timeout 1000000 install
WORKDIR /usr/src/backend
RUN yarn --network-timeout 1000000 install

COPY ./backend ./backend

RUN yarn build-backend

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
