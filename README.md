<h1 align="center">
    <a href="https://discord.gg/rem"><img src="http://i.imgur.com/1lPOnSm.jpg" width="256px" alt="Rem"></a>
  <br>
    Rem
  <br>
 </h1>
<h4 align="center">The rewrite of Rem, now even cleaner and soon fully documented.</h4>
<h5 align="center">This Code is provided as is, there will be no support for getting it to run.</h5>
  <p align="center">
      <a href="https://discord.gg/yuTxmYn" target="_blank"><img src="https://discordapp.com/api/guilds/206530953391243275/embed.png" alt="Discord"></a>
    <a href="https://david-dm.org/DasWolke/rem-v2" target="_blank"><img src="https://david-dm.org/DasWolke/rem-v2/status.svg" alt="Dependencies"></a>
    <a href="https://github.com/rem-bot-industries/rem-v2/blob/master" target="_blank"><img src="https://img.shields.io/github/stars/DasWolke/rem-v2.svg?style=social&label=Star" alt="Github Stars"></a>
    <a href="https://github.com/rem-bot-industries/rem-v2/issues" target="_blank"><img src="https://img.shields.io/github/issues/DasWolke/rem-v2.svg" alt="Github Issues"></a>
  </p>
  
-------------------

## Contributing Guidelines

I will write those if people actually want to contribute. Until then: Just make it work good and fast. uwu

## Requirements:
* Node and NPM
* Git
* MongoDB (follow instructions on how to configure the server at [https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/))
* Redis, which can be found here: [redis](https://redis.io/download)
* ffmpeg and youtube-dl
* Buildtools and Python 2.7
* Basic understanding of node js

## Installation instructions

1. Install MongoDB with the [guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/).
2. Install redis with the [guide](https://redis.io/topics/quickstart)
2. Install git, Here is the [link](https://git-scm.com/downloads) to get it.
3. Install node, Here is the [link](https://nodejs.org/en/download/current/) to get it.
4. Install ffmpeg and add it to path, it can be found [here](https://ffmpeg.org/download.html), if you are on linux, you might wanna compile it, here is a [guide](https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu) for that
5. If you have Windows, open a console with administrator permissions and type `npm install --global windows-build-tools` into it.
This will install the neccessary tools, which will be later needed by npm to build Rems dependencies.
6. For Linux environments, you should get `build-essential` and `python 2.7` installed.
7. Clone the source of v2 from git
8. Go into the just created directory and open a cmd and execute `npm install`.
There could be some errors while installing the dependencies as the optional depenency of rem links to `eris-crystal`
If the installation fails, due to not being able to clone the git repo of it, remove it from the dependencies in the package.json.
9. Create the following directories within the root: `temp`,`audio`,`config`
10. Create 2 files within the config directory: `main.json` and `keys.json`. An Example can be found down below.
11. Run `git submodule init` and `git submodule update` to fetch the newest translations
13. Start the MongoDB Server and the Redis Server if you did not do that already
14. Start Rem by going into the src folder and typing the following:  `node index.js`.

### ***Example main.json***
```json
{
  "owner": "Owner Name",
  "owner_id": "Owner ID",
  "environment": "development",
  "no_error_tracking": true,
  "token": "Bot Token",
  "client_id": "Bot Client ID",
  "bot_id": "Bot ID (Same as Client ID)",
  "osu_token": "OSU API TOKEN",
  "osu_username": "osu username",
  "osu_password": "osu password",
  "soundcloud_key": "key for the soundcloud api",
  "sentry_token": "not needed.",
  "anilist_secret": "not used atm",
  "anilist_id": "not used atm",
  "lbsearch_sfw_key": "ibsear.ch key",
  "lbsearch_nsfw_key": "ibsearch.xxx key",
  "cleverbot_api_user": "cleverbot.io api user",
  "cleverbot_api_key": "cleverbot.io api key",
  "mashape_key": "mashape key",
  "use_ws": false,
  "master_hostname": "not needed.",
  "mongo_hostname": "The full database adress: e.g. mongodb://host:port/dbname",
  "redis_hostname": "the redis ip, port is automatically set to 6379",
  "redis_enabled": true,
  "redis_database": 2,
  "shard_token": "not needed."
}
```
- no_error_tracking disables sentry, the bugtracker of rem, leave this set to true.
- use_ws tells rem whether the master server should be used or not, leave this set to false, as it is not needed with one shard.
- the number of shards defines how many processes the master will spawn.
 Can be set to 1 unless you want to operate this fork on over 2500 servers.

## Example keys.json
```json
{
  "keys": [
    "Youtube Api Key, you can add more if you like"
  ]
}
```

## Helpful links
If you need help creating tokens and a Youtube api I suggest reading these two tutorials on it.
* https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
* http://docs.thesharks.xyz/install_windows/ (Requirements & API keys section, forward is another case)
