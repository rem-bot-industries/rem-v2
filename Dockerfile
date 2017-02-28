FROM node:7.5-alpine
LABEL maintainer Wolke "wolke@ram.moe"
WORKDIR /usr/src
RUN mkdir rem
WORKDIR /
COPY . /usr/src/rem
WORKDIR /usr/src/rem
RUN apk update && apk upgrade && apk add git python alpine-sdk ffmpeg
RUN npm config set registry http://registry.npmjs.org/ && npm install
RUN mkdir audio && mkdir temp && mkdir logs && rm -rf node_modules/
RUN npm i && npm i -g babel babel-cli babel-preset-latest && npm run build
WORKDIR dist/
ENTRYPOINT [ "node", "index.js" ]