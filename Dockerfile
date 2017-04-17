FROM node:7.9.0-alpine
LABEL maintainer Wolke "wolke@ram.moe"
RUN apk update && apk upgrade && apk add git python alpine-sdk ffmpeg
WORKDIR /usr/src
RUN mkdir rem
WORKDIR /
WORKDIR /usr/src/rem
COPY package.json /usr/src/rem
RUN npm config set registry http://registry.npmjs.org/ && npm install
COPY . /usr/src/rem
RUN mkdir audio && mkdir temp
RUN npm i -g babel babel-cli babel-preset-latest && npm run doit
WORKDIR dist/
ENTRYPOINT [ "node", "index.js" ]