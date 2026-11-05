FROM node:26.13.0-alpine

WORKDIR /usr/src/backend

ENV NODE_ENV=production

RUN apk update
RUN apk add curl
RUN npm install -g yarn@1.22.22

COPY ./yarn.lock ./
COPY ./package.json ./

RUN yarn --network-timeout 1000000 install

COPY ./ ./

RUN yarn build
RUN rm -rf ./src

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
