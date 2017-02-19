/**
 * Created by Julian/Wolke on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let Cache;
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
} else {
    Cache = require('./../../structures/cache');
    settingsCache = Cache;
}
let settingsCache;
class SettingsManager extends Manager {
    constructor({mod}) {
        super();
        this.version = '1.0.0';
        this.name = 'Settingsmanager';
        this.shortcode = 'sm';
        this.mod = mod;
        if (remConfig.redis_enabled) {
            settingsCache = new Cache(this.mod.getMod('redis'));
        }
    }

    async get(id, type, key) {
        let setting = await settingsCache.get(`${id}_${type}_${key}`);
        if (setting) {
            return Promise.resolve(setting);
        }
        return settingsModel.find({id, type, key});
    }

    async set(newSetting) {
        let oldSetting = await settingsCache.get(`${newSetting.id}_${newSetting.type}_${newSetting.key}`);
        if (oldSetting.key === newSetting.key && oldSetting.value === newSetting.value) return Promise.resolve(oldSetting);
        await settingsModel.update({id: newSetting.id}, {$set: {value: newSetting.value}});
        if (!remConfig.enable_redis) {
            this.emitCacheUpdate(newSetting);
        }
        return Promise.resolve(newSetting);

    }

    async create(discordId, type, key, value) {
        let setting = new settingsModel({
            id: `${discordId}_${type}_${key}`,
            type,
            key,
            value
        });
        await setting.save();
        return Promise.resolve(setting);
    }

    emitCacheUpdate(data) {
        this.emit('_cache_update', {data, type: 'setting'});
    }

}
module.exports = {class: SettingsManager, deps: ['lm'], async: false, shortcode: 'sm'};