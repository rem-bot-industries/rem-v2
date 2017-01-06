/**
 * Created by julia on 01.11.2016.
 */
global.Promise = require('bluebird');
const Eris = require("eris");
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
const EventEmitter = require('eventemitter3');
const guildModel = require('./DB/guild');
const config = require('./config/main.json');
let winston = require('winston');
let raven = require('raven');
let mongoose = require('mongoose');
let url = config.beta ? 'mongodb://localhost/discordbot-beta' : 'mongodb://localhost/discordbot';
let Connector = require('./structures/connector');
let ModuleManager = require('./modules/moduleManager');
mongoose.Promise = Promise;
mongoose.connect(url, (err) => {
    if (err) return winston.error('Failed to connect to the database!');
});
let stat = config.beta ? 'rem-beta' : 'rem-live';
let blocked = require('blocked');
let client = new raven.Client(config.sentry_token);
if (!config.beta) {
    client.patchGlobal(() => {
        winston.error('Oh no I died!');
        process.exit(1);
    });
}
class Shard extends EventEmitter {
    constructor(SHARD_ID, SHARD_COUNT, hub) {
        super();
        this.id = SHARD_ID;
        this.count = SHARD_COUNT;
        this.bot = null;
        this.ready = false;
        this.CON = new Connector();
        this.MSG = null;
        this.HUB = hub;
        this.MOD = new ModuleManager();
        this.GM = null;
        this.UM = null;
        this.interval = null;
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
            bot.editStatus(`online`, {name: `!w.help for commands`});
            this.clientReady()
        });
        bot.on('messageCreate', (msg) => {
            dogstatsd.increment(`${stat}.messages`);
            msg.CON = this.CON;
            this.message(msg)
        });
        bot.on('guildCreate', (Guild) => {
            this.guildCreate(Guild)
        });
        bot.on('guildDelete', (Guild) => {

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
        // bot.on('warn', this.warn);
        bot.on('error', this.error);
        process.on('SIGINT', () => {
            this.shutdown()
        });
        bot.connect();
    }

    clientReady() {
        this.MOD.init().then(() => {
            this.ready = true;
            this.MSG = this.MOD.getMod('mm');
            this.GM = this.MOD.getMod('gm');
            this.UM = this.MOD.getMod('um');
            this.UM.on('_cache_update', (data) => {
                this.emitCacheUpdate(data);
            });
            this.GM.on('_cache_update', (data) => {
                this.emitCacheUpdate(data);
            });
            this.HUB.on('_cache_update', (data) => {
                this.updateLocalCache(data);
            });
            this.HUB.emit('_guild_update', this.id, this.bot.guilds.size);
            this.HUB.emit('_user_update', this.id, this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b));
            winston.info('commands are ready!');
            this.sendStats();
            this.createInterval();
        });
        // this.LANG = new LanguageManager();
        // this.VOICE = new VoiceManager();
        // this.MSG = new MsgManager(this.LANG, this.VOICE);
        // this.MSG.on('ready', (cmds) => {
        //     this.ready = true;
        //     this.HUB.emit('_guild_update', this.id, this.bot.guilds.size);
        //     this.HUB.emit('_user_update', this.id, this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b));
        //     winston.info('commands are ready!');
        //     this.sendStats();
        //     this.createInterval();
        //     // console.log(cmds);
        // });
    }

    message(msg) {
        if (this.ready && !msg.author.bot) {
            this.CON.invokeAllCollectors(msg);
            this.MSG.check(msg);
        }
    }

    guildCreate(Guild) {
        this.sendStats();
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

    guildDelete(Guild) {
        this.sendStats();
    }

    guildMemberAdd(member) {

    }

    guildMemberRemove(member) {

    }

    voiceUpdate(member, channel, leave) {
        // if (!leave) {
        //     console.log('user joined voice!');
        // } else {
        //     console.log('user left voice!');
        // }
    }

    debug(info) {
        console.debug(info);
    }

    warn(info) {
        winston.warn(info);
    }

    error(err) {
        winston.error(err);
    }

    shutdown() {
        clearInterval(this.interval);
        mongoose.connection.close();
        try {
            this.bot.disconnect();
        } catch (e) {
            console.log(e);
        }
        setTimeout(() => {
            process.exit(0);
        }, 200);
    }

    createInterval() {
        this.interval = setInterval(() => {
            this.sendStats();
        }, 1000 * 500);
    }

    sendStats() {
        this.HUB.emit('_guild_update', this.id, this.bot.guilds.size);
        this.HUB.emit('_user_update', this.id, this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b));
    }

    updateLocalCache({type, data}) {
        switch (type) {
            case 'user':
                this.MOD.getMod('um').updateCache(data);
                return;
            case 'guild':
                this.MOD.getMod('gm').updateCache(data);
                return;
            default:
                return;
        }
    }

    emitCacheUpdate({type, data}) {
        this.HUB.emitRemote('_cache_update', {shard: this.id, type, data});
    }


}
module.exports = Shard;
