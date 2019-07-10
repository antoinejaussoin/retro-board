FROM node:12-alpine

# App directory
WORKDIR /usr/src/backend

RUN npm i -g yarn

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./retro-board-server/package.json ./retro-board-server/
COPY ./retro-board-common/package.json ./retro-board-common/

RUN yarn install

COPY ./retro-board-server ./retro-board-server
COPY ./retro-board-common ./retro-board-common

# Arguments (these are default but can be overridden)
ENV SERVER_SALT=9Iz9YynnBmMY2I1N3qAR
ENV DB_TYPE=postgres
ENV DB_NAME=retroboard
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV JWT_SECRET=AVkeawWwqqqX03nWNtfA
ENV SESSION_SECRET=2Kvmtdz1pVMeKC7GW7a6
ENV PORT=3005
ENV NODE_ENV=production

RUN yarn build-server

EXPOSE ${PORT}
CMD [ "yarn", "start-server-production" ]