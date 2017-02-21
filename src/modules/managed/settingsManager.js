/**
 * Created by Julian/Wolke on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let Cache;
let settingsCache;
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
} else {
    Cache = require('./../../structures/cache');
    settingsCache = Cache;
}
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

    async get(discordId, type, key) {
        let setting = await settingsCache.get(`${discordId}_${type}_${key}`);
        if (setting) {
            return setting;
        }
        let id = `${discordId}_${type}_${key}`;
        setting = await settingsModel.findOne({id: id, type: type, key: key});
        if (setting) {
            await settingsCache.set(setting.id, setting);
        }
        return setting;
    }

    async getOldSetting(oldSetting) {
        let setting = await settingsCache.get(oldSetting.id);
        if (setting) {
            return Promise.resolve(setting);
        }
        return settingsModel.findOne({id: oldSetting.id, type: oldSetting.type, key: oldSetting.key});
    }

    async set(newSetting) {
        let oldSetting = await this.getOldSetting(newSetting);
        if (oldSetting.key === newSetting.key && oldSetting.value === newSetting.value) return Promise.resolve(oldSetting);
        await settingsModel.update({id: newSetting.id}, {$set: {value: newSetting.value}});
        await settingsCache.set(newSetting.id, newSetting);
        if (!remConfig.redis_enabled) {
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
        await settingsCache.set(setting.id, setting);
        return Promise.resolve(setting);
    }

    async remove(setting) {
        await settingsCache.remove(setting.id);
        return settingsModel.remove({id: setting.id, type: setting.type, key: setting.key});
    }

    emitCacheUpdate(data) {
        this.emit('_cache_update', {data, type: 'setting'});
    }

}
module.exports = {class: SettingsManager, deps: [], async: false, shortcode: 'sm'};