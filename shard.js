/**
 * Created by julia on 01.11.2016.
 */
const Discord = require("discord.js");
const EventEmitter = require('eventemitter3');
const CmdManager = require('./modules/cmdManager');
const LanguageManager = require('./modules/langManager');
const VoiceManager = require('./modules/voiceManager');
const guildModel = require('./DB/guild');
let CMD;
let LANG;
let VOICE;
const config = require('./config/main.json');
let winston = require('winston');
let raven = require('raven');
let mongoose = require('mongoose');
let url = config.beta ? 'mongodb://localhost/discordbot-beta' : 'mongodb://localhost/discordbot';
let Promise = require('bluebird');
mongoose.Promise = Promise;
mongoose.connect(url, (err) => {
    if (err) return winston.error('Failed to connect to the database!');
});
let blocked = require('blocked');
let client = new raven.Client(config.sentry_token);
if (!config.beta) {
    client.patchGlobal(() => {
        winston.error('Oh no I died!');
        process.exit(1);
    });
}
class Shard extends EventEmitter {
    constructor(SHARD_ID, SHARD_COUNT) {
        super();
        this.id = SHARD_ID;
        this.count = SHARD_COUNT;
        this.bot = null;
        this.ready = false;
        this.init();
    }

    init() {
        blocked((ms) => {
            console.log('Shard:' + this.id + ' BLOCKED FOR %sms', ms | 0);
        });
        this.initClient();
    }

    initClient() {
        winston.info(typeof(this.count));
        let options = {
            messageCacheMaxSize: 1000,
            messageCacheLifetime: 600,
            messageSweepInterval: 1200,
            disableEveryone: true,
            fetchAllMembers: true,
            shardId: parseInt(this.id),
            shardCount: parseInt(this.count),
            disabledEvents: ['typingStart', 'typingStop', 'guildMemberSpeaking', 'messageUpdate']
        };
        winston.info(options);
        let bot = new Discord.Client(options);
        this.bot = bot;
        bot.on('ready', () => {
            this.clientReady()
        });
        bot.on('message', (msg) => {
            this.message(msg)
        });
        bot.on('guildCreate', (Guild) => {
            this.guildCreate(Guild)
        });
        bot.on('voiceStateUpdate', (o, n) => {
            this.voiceUpdate(o, n)
        });
        bot.on('guildMemberAdd', (m) => {
            this.guildMemberAdd(m)
        });
        bot.on('guildMemberRemove', (m) => {
            this.guildMemberRemove(m)
        });
        // bot.on('debug', this.debug);
        bot.login(config.token).then(winston.info('Logged in successfully'));
        process.on('message', (msg) => {
            this.clusterAction(msg);
        });
        process.on('SIGINT', () => {
            this.shutdown()
        });
    }

    clientReady() {
        LANG = new LanguageManager();
        VOICE = new VoiceManager();
        CMD = new CmdManager(LANG, VOICE);
        CMD.on('ready', (cmds) => {
            this.ready = true;
            winston.info('commands are ready!');
            // console.log(cmds);
        });
    }

    message(msg) {
        if (this.ready) {
            CMD.check(msg);
        }
    }

    guildCreate(Guild) {
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
                    if (err) return winston.error(err);
                });
            }
        });
    }

    guildMemberAdd(member) {

    }

    guildMemberRemove(member) {

    }

    voiceUpdate(oldMember, newMember) {
        if (oldMember.voiceChannel) {
            if (!newMember.voiceChannel) {
                console.log('user left voice');
            }
        } else {
            if (newMember.voiceChannel) {
                console.log('user joined voice');
            }
        }
    }

    debug(info) {

    }

    clusterAction(m) {
        console.log(m);
        console.log(this.ready);
        if (this.ready) {
            console.log(m);
            if (m.type === 'guild') {
                process.send({id: this.id, type: 'guild', d: this.bot.guilds.size});
            }
            if (m.type === 'stats') {
                let users = this.bot.guilds.map(g => g.memberCount);
                users = users.reduce((prev, val) => prev + val, 0);
                let guilds = this.bot.guilds.size;
                console.log(`Users: ${users} Guilds:${guilds}`);
                process.send({id: this.id, type: 'stats', d: {users: users, guilds: guilds}});
                console.log('sended message')
            }
        }
    }

    shutdown() {
        mongoose.connection.close();
        try {
            this.bot.destroy();
        } catch (e) {
            console.log(e);
        }
        process.exit(0);
    }
}
module.exports = Shard;
