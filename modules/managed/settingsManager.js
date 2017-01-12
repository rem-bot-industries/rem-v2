/**
 * Created by julia on 17.12.2016.
 */
let Manager = require('../../structures/manager');
let settingsModel = require('../../DB/setting');
let settingCache = require('../../structures/cache');
class SettingsManager extends Manager {
    constructor() {
        super();
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

    setSetting() {

    }

}
module.exports = {class: SettingsManager, deps: [], async: false, shortcode: 'sm'};