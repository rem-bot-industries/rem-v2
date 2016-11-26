/**
 * Created by julia on 01.11.2016.
 */
const Eris = require("eris");
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
            autoreconnect: true,
            compress: true,
            messageLimit: 200,
            disableEveryone: true,
            getAllUsers: true,
            firstShardID: parseInt(this.id),
            lastShardID: parseInt(this.id),
            maxShards: parseInt(this.count),
            disableEvents: ['typingStart', 'typingStop', 'guildMemberSpeaking', 'messageUpdate']
        };
        winston.info(options);
        let bot = new Eris(config.token, options);
        this.bot = bot;
        global.rem = bot;
        bot.on('ready', () => {
            this.clientReady()
        });
        bot.on('messageCreate', (msg) => {
            this.message(msg)
        });
        bot.on('guildCreate', (Guild) => {
            this.guildCreate(Guild)
        });
        bot.on('voiceChannelJoin', (m, n) => {
            this.voiceUpdate(m, n, false);
        });
        bot.on('voiceChannelLeave', (m, o) => {
            this.voiceUpdate(m, o, true);
        });
        bot.on('guildMemberAdd', (g, m) => {
            this.guildMemberAdd(g, m)
        });
        bot.on('guildMemberRemove', (g, m) => {
            this.guildMemberRemove(g, m)
        });
        // bot.on('debug', this.debug);
        process.on('message', (msg) => {
            this.clusterAction(msg);
        });
        process.on('SIGINT', () => {
            this.shutdown()
        });
        bot.connect();
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
            CMD.check(msg, this.bot);
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

    voiceUpdate(member, channel, leave) {
        if (!leave) {
            console.log('user joined voice!');
        } else {
            console.log('user left voice!');
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
            this.bot.disconnect();
        } catch (e) {
            console.log(e);
        }
        process.exit(0);
    }
}
module.exports = Shard;
