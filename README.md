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
1. Install MongoDB with the [guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/).
2. Install git, Here is the [link](https://git-scm.com/downloads) to get it.
3. Install node, Here is the [link](https://nodejs.org/en/download/current/) to get it.
4. Install youtube-dl, which can be found [here](https://rg3.github.io/youtube-dl/download.html), make sure to have it in your path.
5. Install ffmpeg and add it to path, it can be found [here](https://ffmpeg.org/download.html)
6. If you have Windows, open a console with administrator permissions and type `npm install --global windows-build-tools` into it. This will install the neccessary tools, which will be later needed by npm to build Rems dependencies
7. For Linux environments, you should get `buildtools-essentials` and `python 2.7` installed.
8. Clone the source of v2 from git
9. Go into the just created directory and open a cmd and execute `npm install --no-optional`
10. Create the following directories within the root: `temp`,`audio`,`config`
11. Create 2 files within the config directory: `main.json` and `keys.json`. An Example can be found down below.
12. Run `npm run build` in your terminal and then start rem by going into the dist folder and then executing `node index.js` in there.

## Example main.json
```json
{
  "owner":"The owner name",
  "owner_id":"The discord id of the owner",
  "token":"The actual discord api token",
  "client_id":"the client id of the bot",
  "bot_id":"the bot id of the bot, if there is no field in the app screen named bot id, copy the clientid in here",
  "version": "The version of the bot",
  "beta":true,
  "osu_token":"The token for the osu api",
  "osu_path":"./audio",
  "osu_username":"The username that should be used when downloading osu songs",
  "osu_password":"the password of the osu account",
  "no_error_tracking":true,
  "shards":1,
  "lbsearch_sfw_key":"the key to use for the ibsear.ch lookup",
  "lbsearch_nsfw_key":"the key to use for the ibsearch.xxx lookup",
  "cleverbot_api_key":"Contact Info, so that we can use the cleverbot api.",
  "mashape_key":"The key to use for mashape (Urbandictionary)",
  "ws_port":8080
}
```
- Beta should always be set to true.
- no_error_tracking disabled sentry, the bugtracker of rem, leave this set to true.
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

I will wrote those if people actually want to contribute. Until then: Just make it work good and fast. uwu
