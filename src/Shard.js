/**
 * Created by Julian/Wolke on 01.11.2016.
 */
//uwu
const winston = require('winston');
let useCrystal = remConfig.use_crystal;
// let Crystal;
// try {
//     Crystal = require("eris-crystal");
//     useCrystal = true;
// } catch (e) {
//
// }
let VoiceConnectionManager;
if (useCrystal) {
    VoiceConnectionManager = require('eris-novum').VoiceConnectionManager;
}
let Eris = require('eris');
const StatsD = require('hot-shots');
const dogstatsd = new StatsD({host: remConfig.statsd_host});
const guildModel = require('./DB/guild');
const mongoose = require('mongoose');
const url = remConfig.mongo_hostname;
let Connector = require('./structures/connector');
let ModuleManager = require('./modules/moduleManager');
mongoose.Promise = Promise;
mongoose.connect(url, (err) => {
    if (err) return winston.error('Failed to connect to the database!');
});
let redis = require("redis");
const stat = `rem_${remConfig.environment}`;
const blocked = require('blocked');
const procToWs = require('./ws/procToWs');
const hub = new procToWs();
/**
 * The base shard class
 * @extends EventEmitter
 */
class Shard {
    /**
     * The constructor
     * @constructor
     * @param options
     * @param Raven
     */
    constructor(options, Raven) {
        this.id = process.env.SHARD_ID;
        this.count = process.env.SHARD_COUNT;
        this.bot = null;
        this.ready = false;
        this.CON = new Connector();
        this.MSG = null;
        this.HUB = hub;
        this.SHARDED = typeof (hub) !== 'undefined';
        this.MOD = new ModuleManager();
        this.interval = null;
        this.Raven = Raven;
        this.Redis = null;
        console.log('starting shard');
        if (this.SHARDED) {
            this.HUB.updateState('init');
        }
        Promise.promisifyAll(redis.RedisClient.prototype);
        Promise.promisifyAll(redis.Multi.prototype);
        let redisClient = redis.createClient({
            port: remConfig.redis_voice_port,
            host: remConfig.redis_voice_hostname,
            password: remConfig.redis_voice_auth ? remConfig.redis_voice_auth : ''
        });
        redisClient.select(remConfig.redis_database);
        redisClient.on("error", (err) => {
            console.log("Error " + err);
        });
        redisClient.on("ready", () => {
            this.init();
        });
        this.Redis = redisClient;
    }

    /**
     * Setup a listener if the eventloop blocks,
     * then call the initClient method
     */
    init() {
        const options = {
            autoreconnect: true,
            compress: true,
            messageLimit: 0,
            disableEveryone: true,
            getAllUsers: false,
            firstShardID: parseInt(this.id),
            lastShardID: parseInt(this.id),
            maxShards: parseInt(this.count),
            disableEvents: {
                'TYPING_START': true,
                'TYPING_STOP': true,
                'GUILD_MEMBER_SPEAKING': true,
                'MESSAGE_UPDATE': true,
                'MESSAGE_DELETE': true
            },
            crystal: useCrystal
        };
        winston.info(options);
        let bot = new Eris(remConfig.token, options);
        // console.log('Created bot');
        if (useCrystal) {
            bot.voiceConnections = new VoiceConnectionManager({
                port: 6379,
                host: '127.0.0.1',
                userID: remConfig.client_id
            }, 0);
        }
        this.bot = bot;
        global.rem = bot;
        blocked((ms) => {
            if (ms > 100) {
                dogstatsd.increment(`${stat}.blocks`);
            }
            console.log('Shard:' + this.id + ' BLOCKED FOR %sms', ms | 0);
        });
        this.initClient();
        this.bot.connect().then(() => {
            // console.log('connected')
        }).catch(err => {
            console.log(err);
        });
    }

    /**
     * Initiates the Client and Eris
     * In this function Rem sets up listeners for common events, configures eris and starts the lib
     */
    initClient() {
        this.bot.on('ready', () => {
            if (this.SHARDED) {
                this.HUB.send({action: 'updateState', d: {state: 'discord_ready'}});
            }
            // console.log('READY!');
            this.bot.editStatus('online', {name: '!w.help for commands'});
            this.clientReady();
        });
        this.bot.on('messageCreate', (msg) => {
            dogstatsd.increment(`${stat}.messages`);
            msg.CON = this.CON;
            this.message(msg);
        });
        this.bot.on('guildCreate', (Guild) => {
            this.guildCreate(Guild);
        });
        this.bot.on('guildDelete', (Guild) => {
            this.guildDelete(Guild);
        });
        this.bot.on('voiceChannelJoin', (m, n) => {
            this.voiceUpdate(m, n, false);
        });
        this.bot.on('voiceChannelLeave', (m, o) => {
            this.voiceUpdate(m, o, true);
        });
        this.bot.on('guildMemberAdd', (g, m) => {
            this.guildMemberAdd(g, m);
        });
        this.bot.on('guildMemberRemove', (g, m) => {
            this.guildMemberRemove(g, m);
        });
        // this.bot.on('debug', (data) => {
        //     console.log(data);
        // });
        this.bot.on('warn', this.warn);
        this.bot.on('error', this.error);
        process.on('SIGINT', () => {
            this.shutdown();
        });
        if (this.SHARDED) {
            this.HUB.updateState('connecting');
        }
    }

    /**
     * Here comes the really interesting stuff.
     * 1. Rem starts the init function of the Module Loader, which loads all mods inside /managed
     * 2. Once the modloader is done, rem gets the needed mods and sets them as instancevariables
     * 3. Then some event listeners are setup, which are later used for cache-syncing
     * 4. Rem logs that the commands are ready.
     * 5. Now, Rem sends an initial data update to the main process to update the guild/user counts if necessary.
     * 6. A Interval gets created to update data every 5 mins
     */
    clientReady() {
        this.MOD.init(this.HUB, this.Raven, this.Redis).then(() => {
            if (this.SHARDED) {
                this.HUB.updateState('bot_ready');
            }
            this.ready = true;
            this.MSG = this.MOD.getMod('mm');
            this.SM = this.MOD.getMod('sm');
            if (this.SHARDED) {
                this.HUB.on('action', (event) => {
                    this.hubAction(event);
                });
            }
            winston.info('commands are ready!');
            this.sendStats();
            this.createInterval();
        });
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
            if (err) {
                this.Raven.captureError(err);
                return winston.error(err);
            }
            if (guild) {

            } else {
                let guild = new guildModel({
                    id: Guild.id,
                    nsfwChannels: [],
                    cmdChannels: [],
                    lastVoiceChannel: '',
                    levelEnabled: true,
                    pmNotifications: true,
                    chNotifications: false,
                    prefix: '!w.',
                    lng: 'en'
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

    async guildMemberAdd(Guild, Member) {
        if (this.ready) {
            try {
                let greeting = await this.SM.get(Guild.id, 'guild', 'greeting.text');
                let greetingChannel = await this.SM.get(Guild.id, 'guild', 'greeting.channel');
                if (greeting && greetingChannel) {
                    let channel = Guild.channels.find(c => c.id === greetingChannel.value);
                    if (channel) {
                        let msg = greeting.value;
                        msg = msg.replace(/%USER%/g, Member.mention);
                        msg = msg.replace(/%USER_NO_MENTION%/g, Member.username ? Member.username : Member.user.username);
                        msg = msg.replace(/%GUILD%/g, Guild.name);
                        await channel.createMessage(msg);
                    }
                }
            } catch (e) {
                winston.error(e);
            }
        }
    }

    async guildMemberRemove(Guild, Member) {
        if (this.ready) {
            try {
                let farewell = await this.SM.get(Guild.id, 'guild', 'farewell.text');
                let farewellChannel = await this.SM.get(Guild.id, 'guild', 'farewell.channel');
                if (farewell && farewellChannel) {
                    let channel = Guild.channels.find(c => c.id === farewellChannel.value);
                    if (channel) {
                        let msg = farewell.value;
                        msg = msg.replace(/%USER%/g, Member.username ? Member.username : Member.user.username);
                        msg = msg.replace(/%GUILD%/g, Guild.name);
                        await channel.createMessage(msg);
                    }
                }
            } catch (e) {
                winston.error(e);
            }
        }
    }

    voiceUpdate(member, channel, leave) {
        // if (!leave) {
        //     console.log('user joined voice!');
        // } else {
        //     console.log('user left voice!');
        // }
    }

    debug(info) {
        console.log(info);
    }

    warn(info) {
        console.log(info);
    }

    error(err) {
        console.log(err);
    }

    shutdown() {
        clearInterval(this.interval);
        mongoose.connection.close();
        if (remConfig.redis_enabled) {
            this.Redis.quit();
        }
        try {
            this.bot.disconnect();
        } catch (e) {
            console.log(e);
        }
    }

    createInterval() {
        this.interval = setInterval(() => {
            this.sendStats().then().catch(e => {
                console.error(e);
            });
        }, 1000 * 30);
    }

    async sendStats() {
        if (remConfig.redis_enabled) {
            await this.Redis.set(`guild_size_${this.id}`, this.bot.guilds.size);
            await this.Redis.set(`user_size_${this.id}`, this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b));
            await this.Redis.set(`shard_stats_${this.id}`, JSON.stringify({
                users: this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b),
                guilds: this.bot.guilds.size,
                channels: this.bot.guilds.map(g => g.channels.size).reduce((a, b) => a + b),
                voice: rem.voiceConnections.size,
                voice_active: rem.voiceConnections.filter((vc) => vc.playing).length
            }))
        }
        if (this.SHARDED) {
            this.HUB.updateStats({
                guilds: this.bot.guilds.size,
                users: this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b),
                channels: this.bot.guilds.map(g => g.channels.size).reduce((a, b) => a + b),
                voice: rem.voiceConnections.size,
                voice_active: rem.voiceConnections.filter((vc) => vc.playing).length
            });
        }
    }

    hubAction(event) {
        switch (event.action) {
            case 'shard_info': {
                //Thanks abal
                let data = {
                    users: this.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b),
                    guilds: this.bot.guilds.size,
                    channels: this.bot.guilds.map(g => g.channels.size).reduce((a, b) => a + b),
                    voice: this.bot.voiceConnections.size,
                    voice_active: this.bot.voiceConnections.filter((vc) => vc.playing).length,
                    ram_usage: process.memoryUsage().rss,
                    host: process.env.HOSTNAME ? process.env.HOSTNAME : process.pid
                };
                this.resolveAction(event, data);
                return;
            }
            case 'user_info_id': {
                let user = this.bot.users.find(u => u.id === event.user_id);
                if (user) {
                    user.found = true;
                    this.resolveAction(event, user);
                } else {
                    this.resolveAction(event, {found: false});
                }
                return;
            }
            case 'guild_info_id': {
                let guild = this.bot.guilds.find(g => g.id === event.guild_id);
                if (guild) {
                    guild.found = true;
                    this.resolveAction(event, this.simplifyGuildData(guild));
                } else {
                    this.resolveAction(event, {found: false});
                }
                return;
            }
            default:
                return;
        }
    }

    simplifyGuildData(guild) {
        let owner = guild.members.find(m => m.id === guild.ownerID).user;
        return {
            id: guild.id,
            name: guild.name,
            region: guild.region,
            ownerID: guild.ownerID,
            iconURL: guild.iconURL,
            found: true,
            memberCount: guild.memberCount,
            sid: guild.shard.id,
            joinedAt: guild.joinedAt,
            createdAt: guild.createdAt,
            owner: owner
        };
    }

    resolveAction(event, data) {
        if (this.SHARDED) {
            try {
                this.HUB.respondAction(event, data);
            } catch (e) {
                console.log(e);
            }
        }
    }
}
module.exports = Shard;