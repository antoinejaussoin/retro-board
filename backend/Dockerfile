FROM node:lts-alpine

WORKDIR /usr/src/backend

ENV NODE_ENV=production

COPY ./yarn.lock ./
COPY ./package.json ./

RUN yarn --network-timeout 1000000 install

COPY ./ ./

RUN yarn build
RUN rm -rf ./src

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
