/**
 * Created by julia on 01.11.2016.
 */
var CmdManager = require('./modules/cmdManager');
var LanguageManager = require('./modules/langManager');
var VoiceManager = require('./modules/voiceManager');
var RemoteManager = require('./modules/remoteManager');
var guildModel = require('./DB/guild');
var CMD;
var LANG;
var VOICE;
var BRIDGE;
var config = require('./config/main.json');
var winston = require('winston');
var raven = require('raven');
var mongoose = require('mongoose');
let url = config.beta ? 'mongodb://localhost/discordbot-beta' : 'mongodb://localhost/discordbot';
var Promise = require('bluebird');
mongoose.Promise = Promise;
mongoose.connect(url, (err) => {
    if (err) return winston.error('Failed to connect to the database!');
});
var blocked = require('blocked');
blocked(function (ms) {
    console.log('Shard:' + process.env.SHARD_ID + ' BLOCKED FOR %sms', ms | 0);
});
var client = new raven.Client(config.sentry_token);
var Discord = require("discord.js");
var options = {
    messageCacheMaxSize: 1000,
    messageCacheLifetime: 600,
    messageSweepInterval: 1200,
    disableEveryone: true,
    fetchAllMembers: true,
    disabledEvents: ['typingStart', 'typingStop', 'guildMemberSpeaking', 'messageUpdate']
};
winston.info(options);
var bot = new Discord.Client(options);
if (!config.beta) {
    client.patchGlobal(() => {
        winston.error('Oh no I died!');
        process.exit(1);
    });
}
bot.on('ready', () => {
    LANG = new LanguageManager();
    VOICE = new VoiceManager();
    CMD = new CmdManager(LANG, VOICE);
    // BRIDGE = new RemoteManager('127.0.0.1', 8000, process.env.SHARD_ID);
    CMD.on('ready', (cmds) => {
        console.log('commands are ready!');
        // console.log(cmds);
    });
});
// bot.on('debug', info => winston.info('Debug:' + info));
bot.on("message", (msg) => {
    CMD.check(msg);
});
bot.on('guildCreate', (Guild) => {
    guildModel.findOne({id: Guild.id}, (err, guild) => {
        if (err) return winston.error(err);
        if (guild) {

        } else {
            let guild = new guildModel({
                id: Guild.id,
                nsfwChannels: [],
                cmdChannels: [],
                lastVoiceChannel: "",
                levelEnabled: true,
                pmNotifications: true,
                chNotifications: false,
                prefix: "!w.",
                lng: "en"
            });
            guild.save((err) => {
                if (err) return winston.info(err);
            });
        }
    });
});
bot.on('guildMemberAdd', (member) => {

});
bot.on('guildMemberRemove', (member) => {

});
bot.on('voiceStateUpdate', (oldMember, newMember) => {
    if (oldMember.voiceChannel) {
        if (!newMember.voiceChannel) {
            console.log('user left voice');
        }
    } else {
        if (newMember.voiceChannel) {
            console.log('user joined voice');
        }
    }
});
bot.login(config.token).then(winston.info('Logged in successfully'));
process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: \n" + err.stack);
});