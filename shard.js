/**
 * Created by julia on 01.11.2016.
 */
var CmdManager = require('./modules/cmdManager');
var LanguageManager = require('./modules/langManager');
var VoiceManager = require('./modules/voiceManager');
var serverModel = require('./DB/server');
var CMD;
var LANG;
var VOICE;
var config = require('./config/main.json');
var winston = require('winston');
var raven = require('raven');
var blocked = require('blocked');
blocked(function (ms) {
    console.log('Shard:' + process.env.SHARD_ID + ' BLOCKED FOR %sms', ms | 0);
});
var client = new raven.Client(config.sentry_token);
var Discord = require("discord.js");
var options = {
    messageCacheMaxSize: 2500,
    disableEveryone: true,
    fetchAllMembers: true,
    disabledEvents: ['typingStart', 'typingStop','guildMemberSpeaking', 'messageUpdate']
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
    serverModel.findOne({id: Guild.id}, (err, server) => {
        if (err) return winston.error(err);
        if (server) {

        } else {
            let server = new serverModel({
                id: Guild.id,
                nsfwChannels: [],
                cmdChannels: [],
                lastVoiceChannel: "",
                levelEnabled: true,
                pmNotifications: true,
                chNotifications: false,
                prefix: "!w."
            });
            server.save((err) => {
                if (err) return winston.info(err);
            });
        }
    });
});
bot.on('guildMemberAdd', (member) => {

});
bot.on('guildMemberRemove', (member) => {

});
bot.login(config.token).then(winston.info('Logged in successfully'));