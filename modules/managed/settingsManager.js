/**
 * Created by julia on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let guildSettingCache = require('../../structures/cache');
let channelSettingCache = require('../../structures/cache');
let userSettingCache = require('../../structures/cache');
let validKeys = {
    guild: {}, user: {}, channel: {}
};
class SettingsManager extends Manager {
    constructor({mod}) {
        super();
    }

    updateCache(data) {
        switch (data.type) {
            case "guild": {
                if (channelSettingCache.get(data.id)) {
                    channelSettingCache.set(data.id, data);
                }
                return;
            }
            case "channel": {
                if (channelSettingCache.get(data.id)) {
                    channelSettingCache.set(data.id, data);
                }
                return;
            }
            case "user": {
                if (channelSettingCache.get(data.id)) {
                    channelSettingCache.set(data.id, data);
                }
                return;
            }
        }
    }

    loadSettings(id, type) {
        return new Promise(function () {
            return settingsModel.find({id, type});
        });
    }

    getSetting(id, type, key) {
        return new Promise(function () {
            return settingsModel.find({id, type, key});
        });
    }

    get(key, id) {

    }

    set(key, id) {

    }

    findKey(key) {
        if (validKeys[key]) {

        }
    }

    getValidKeys() {
        return validKeys;
    }

    emitCacheUpdate(data) {
        this.emit('_cache_update', {data, type: 'setting'});
    }

}
module.exports = {class: SettingsManager, deps: [], async: false, shortcode: 'sm'};