/**
 * Created by Julian/Wolke on 10.11.2016.
 */
let Manager = require('../../structures/manager');
let guildModel = require('../../DB/guild');
let Cache;
let guildCache;
const winston = require('winston');
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
    winston.debug('Using Redis Cache for Guilds!');
} else {
    Cache = require('./../../structures/cache');
    guildCache = Cache;
    winston.debug('Using Map Cache for Guilds!');
}
class GuildManager extends Manager {
    constructor({mod}) {
        super();
        this.mod = mod;
        this.Raven = mod.getMod('raven');
        if (remConfig.redis_enabled) {
            let redis = this.mod.getMod('redis');
            guildCache = new Cache(redis);
        }
    }

    async createGuild(id) {
        let guild = new guildModel({
            id: id,
            nsfwChannels: [],
            cmdChannels: [],
            lastVoiceChannel: '',
            levelEnabled: true,
            pmNotifications: true,
            chNotifications: false,
            prefix: '!w.',
            lng: 'en'
        });
        return guild.save();
    }

    async loadGuild(id) {
        let Guild;
        try {
            Guild = await guildCache.get(`guild_${id}`);
            if (Guild) {
                winston.debug(`Loaded Guild ${id} from Cache!`);
                return Guild;
            }
        } catch (e) {
            this.Raven.captureException(e);
            winston.error(e);
        }
        Guild = await guildModel.findOne({id: id});
        if (Guild) {
            winston.debug(`Loaded Guild ${id} from Database!`);
            try {
                await guildCache.set(`guild_${Guild.id}`, Guild);
                winston.debug(`Added Guild ${id} to the Cache!`);
            } catch (e) {
                this.Raven.captureException(e);
                console.error(e);
            }
            return Guild;
        } else {
            winston.info(`Creating Guild ${id} in Database!`);
            return this.createGuild(id);
        }
    }

    async changeLanguage(id, lng) {
        let Guild = await guildCache.get(`guild_${id}`);
        Guild.lng = lng;
        await guildCache.set(`guild_${Guild.id}`, Guild);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(Guild);
        }
        return guildModel.update({id: id}, {$set: {lng: lng}});
    }

    async changePrefix(id, prefix, cb) {
        let Guild = await guildCache.get(`guild_${id}`);
        Guild.prefix = prefix;
        await guildCache.set(`guild_${Guild.id}`, Guild);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(Guild);
        }
        return guildModel.update({id: id}, {$set: {prefix: prefix}}, cb);
    }

    updateCache(data) {
        if (guildCache.get(data.id)) {
            guildCache.set(data.id, data);
        }
    }

    sendCacheUpdate(data) {
        this.emit('_cache_update', {type: 'guild', data});
    }

}
module.exports = {class: GuildManager, deps: [], async: false, shortcode: 'gm'};