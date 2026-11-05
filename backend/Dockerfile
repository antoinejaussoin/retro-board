FROM node:22-alpine

WORKDIR /usr/src/backend

ENV NODE_ENV=production

RUN apk update
RUN apk add curl

COPY ./package-lock.json ./
COPY ./package.json ./
COPY ./.npmrc ./

RUN npm ci --include=dev --fetch-timeout=1000000

COPY ./ ./

RUN npm run build
RUN rm -rf ./src

EXPOSE ${BACKEND_PORT}
CMD [ "npm", "run", "backend-production" ]
