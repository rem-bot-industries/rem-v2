FROM node:7.5-alpine
LABEL maintainer Wolke "wolke@ram.moe"
RUN apk update
RUN apk upgrade
RUN apk add git python alpine-sdk ffmpeg
RUN npm config set registry http://registry.npmjs.org/ && npm install
RUN mkdir audio
RUN mkdir temp
RUN mkdir logs
RUN rm -rf node_modules/
RUN npm i
RUN npm i -g babel babel-cli babel-preset-latest
RUN npm run build
WORKDIR dist/
ENTRYPOINT [ "node", "index.js" ]