/**
 * Created by Julian/Wolke on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let guildSettingCache = require('../../structures/cache');
let channelSettingCache = require('../../structures/cache');
let userSettingCache = require('../../structures/cache');
let roleSettingsCache = require('../../structures/cache');
class SettingsManager extends Manager {
    constructor({mod}) {
        super();
        this.mod = mod;
    }

    updateCache(data) {
        switch (data.type) {
            case 'guild': {
                if (guildSettingCache.get(data.id)) {
                    guildSettingCache.set(data.id, data);
                }
                return;
            }
            case 'channel': {
                if (channelSettingCache.get(data.id)) {
                    channelSettingCache.set(data.id, data);
                }
                return;
            }
            case 'role': {
                if (roleSettingsCache.get(data.id)) {
                    roleSettingsCache.set(data.id, data);
                }
                return;
            }
            case 'user': {
                if (userSettingCache.get(data.id)) {
                    userSettingCache.set(data.id, data);
                }
                return;
            }
        }
    }

    getValFromCache(id, type) {
        switch (type) {
            case 'guild': {
                if (guildSettingCache.get(id)) {
                    return guildSettingCache.get(id);
                }
                return;
            }
            case 'channel': {
                if (channelSettingCache.get(id)) {
                    return channelSettingCache.get(id);
                }
                return;
            }
            case 'role': {
                if (roleSettingsCache.get(id)) {
                    return roleSettingsCache.get(id);
                }
                return;
            }
            case 'user': {
                if (userSettingCache.get(id)) {
                    return userSettingCache.get(id)
                }
                return;
            }
        }
    }

    async getSetting(id, type, key) {
        let setting = this.getValFromCache(id, type);
        if (setting) {
            return Promise.resolve(setting);
        }
        return settingsModel.find({id, type, key});
    }

    async setSetting(newSetting) {
        let oldSetting = this.getValFromCache(newSetting.id, newSetting.type);
        if (oldSetting.key === newSetting.key && oldSetting.value === newSetting.value) return;
        await settingsModel.update({id: newSetting.id}, {$set: {value: newSetting.value}});
        this.emitCacheUpdate(newSetting);
        return Promise.resolve(newSetting);

    }

    async createSetting(discordId, type, key, value) {
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