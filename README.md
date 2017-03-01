# Rem v2
>The rewrite of Rem, now even cleaner and soon fully documented.

>This Code is provided as is, there will be no support for getting it to run.

[![Discord](https://discordapp.com/api/guilds/206530953391243275/embed.png)](https://discord.gg/yuTxmYn) [![Dependencies](https://david-dm.org/DasWolke/rem-v2/status.svg)](https://david-dm.org/DasWolke/rem-v2) [![GitHub stars](https://img.shields.io/github/stars/DasWolke/rem-v2.svg?style=social&label=Star)]()[![GitHub issues](https://img.shields.io/github/issues/DasWolke/rem-v2.svg)]()
## Requirements:
* Node and NPM
* Git
* MongoDB (follow instructions on how to configure the server at [https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/))
* ffmpeg and youtube-dl
* Buildtools and Python 2.7
* Basic understanding of node js

## Installation instructions
**Optional** Rem uses Redis for Caching, which can be found here: https://redis.io/download, you dont need it though, as you can disable redis via config.

1. Install MongoDB with the [guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/).
2. Install git, Here is the [link](https://git-scm.com/downloads) to get it.
3. Install node, Here is the [link](https://nodejs.org/en/download/current/) to get it.
4. Install ffmpeg and add it to path, it can be found [here](https://ffmpeg.org/download.html)
5. If you have Windows, open a console with administrator permissions and type `npm install --global windows-build-tools` into it. This will install the neccessary tools, which will be later needed by npm to build Rems dependencies
6. For Linux environments, you should get `buildtools-essentials` and `python 2.7` installed.
7. Clone the source of v2 from git
8. Go into the just created directory and open a cmd and execute `npm install`.
There could be some errors while installing the dependencies as the optional depenency of rem links to `eris-crystal`
If the installation fails, due to not being able to clone the git repo of it, remove it from the dependencies in the package.json.
9. Create the following directories within the root: `temp`,`audio`,`config`
10. Create 2 files within the config directory: `main.json` and `keys.json`. An Example can be found down below.
11. Run `git submodule init` and `git submodule update` to fetch the newest translations
12. Run `npm run build` in your terminal.
13. Start the MongoDB Server
14. Start Rem by going into the dist folder and typing the following:  `node index.js`.

## Example main.json
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
  "redis_enabled": false,
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
* http://docs.thesharks.xyz/install_windows/

## Contibuting Guidelines

I will write those if people actually want to contribute. Until then: Just make it work good and fast. uwu
