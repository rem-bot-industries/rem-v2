/**
 * Created by Julian/Wolke on 10.11.2016.
 */
let Manager = require('../../structures/manager');
let guildModel = require('../../DB/guild');
let Cache;
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
} else {
    Cache = require('./../../structures/cache');
    guildCache = Cache;
}
let guildCache;
class GuildManager extends Manager {
    constructor({mod}) {
        super();
        this.mod = mod;
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
        let Guild = await guildCache.get(`guild_${id}`);
        if (Guild) {
            return Guild;
        }
        Guild = await guildModel.findOne({id: id});
        if (Guild) {
            await guildCache.set(`guild_${Guild.id}`, Guild);
            return Guild;
        } else {
            return this.createGuild(id);
        }
    }

    async changeLanguage(id, lng, cb) {
        let Guild = await guildCache.get(`guild_${id}`);
        Guild.lng = lng;
        await guildCache.set(`guild_${Guild.id}`, Guild);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(Guild);
        }
        return guildModel.update({id: id}, {$set: {lng: lng}}, cb);
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