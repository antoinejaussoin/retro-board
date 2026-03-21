FROM node:24-alpine

WORKDIR /usr/src/backend

ENV NODE_ENV=production

RUN apk update
RUN apk add curl

COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY ./ ./

RUN npm run build
RUN rm -rf ./src

EXPOSE ${BACKEND_PORT}
CMD [ "npm", "run", "backend-production" ]
