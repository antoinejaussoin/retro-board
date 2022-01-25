# This must be run with the Docker context set to the root folder of the repository
# (the one with the yarn.lock file)

FROM node:16-alpine

# App directory
WORKDIR /usr/src/backend

ENV NODE_ENV production

COPY ./yarn.lock ./
COPY ./package.json ./

RUN yarn --network-timeout 1000000 install

COPY ./ ./

RUN yarn build
RUN rm -rf ./src

EXPOSE ${BACKEND_PORT}
CMD [ "yarn", "backend-production" ]
