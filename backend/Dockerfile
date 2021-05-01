# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM node:15-alpine

# App directory
WORKDIR /usr/src/backend

COPY ./yarn.lock ./
COPY ./package.json ./
COPY ./retro-board-server/package.json ./retro-board-server/
COPY ./retro-board-common/package.json ./retro-board-common/

RUN yarn --network-timeout 1000000 install

COPY ./retro-board-server ./retro-board-server
COPY ./retro-board-common ./retro-board-common

RUN yarn build-server

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "start-server-production" ]
