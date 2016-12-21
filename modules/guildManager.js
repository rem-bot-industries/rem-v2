/**
 * Created by julia on 10.11.2016.
 */
let EventEmitter = require('eventemitter3');
let guildModel = require('../DB/guild');
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
            cb(null, guild);
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

    changeLanguage(id, lng, cb) {
        guildModel.update({id: id}, {$set: {lng: lng}}, cb);
    }

    changePrefix(id, prefix, cb) {
        guildModel.update({id: id}, {$set: {prefix: prefix}}, cb);
    }


}
module.exports = GuildManager;