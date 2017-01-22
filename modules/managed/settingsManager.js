/**
 * Created by Julian/Wolke on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let guildSettingCache = require('../../structures/cache');
let channelSettingCache = require('../../structures/cache');
let userSettingCache = require('../../structures/cache');
let validKeys = {
    guild: {
        "language": {type: "String", args: 1, t: ''}
    }, user: {
        "language": {type: "String", args: 1}
    }, channel: {
        "language": {type: "String", args: 1}
    }
};
class SettingsManager extends Manager {
    constructor({mod}) {
        super();
        this.t = mod.getMod('lm').getT();
    }

    updateCache(data) {
        switch (data.type) {
            case "guild": {
                if (guildSettingCache.get(data.id)) {
                    guildSettingCache.set(data.id, data);
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
                if (userSettingCache.get(data.id)) {
                    userSettingCache.set(data.id, data);
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
module.exports = {class: SettingsManager, deps: ['lm'], async: false, shortcode: 'sm'};