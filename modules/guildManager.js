/**
 * Created by julia on 10.11.2016.
 */
var EventEmitter = require('eventemitter3');
var guildModel = require('../DB/guild');
class GuildManager extends EventEmitter {
    constructor() {
        super();
    }

    createGuild(id, cb) {
        let guild = new guildModel({
            id: id,
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
            if (err) return cb(err);
            cb();
        });
    }

    loadGuild(id, cb) {
        guildModel.findOne({id: id}, (err, Guild) => {
            if (err) return cb(err);
            if (Guild) {
                cb(null, Guild);
            } else {
                this.createGuild(id, cb);
            }
        });
    }

    loadLang(id, cb) {
        guildModel.findOne({id: id}, (err, Guild) => {
            if (err) return cb(err);
            if (Guild) {

            } else {

            }
        });
    }

}
module.exports = GuildManager;