/**
 * Created by julia on 10.11.2016.
 */
let Manager = require('../../structures/manager');
let guildModel = require('../../DB/guild');
let guildCache = require('./../../structures/cache');
class GuildManager extends Manager {
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
        let Guild = guildCache.get(id);
        if (Guild) {
            return cb(null, Guild);
        }
        guildModel.findOne({id: id}, (err, Guild) => {
            if (err) return cb(err);
            if (Guild) {
                guildCache.set(Guild.id, Guild);
                this.sendCacheUpdate(Guild);
                cb(null, Guild);
            } else {
                this.createGuild(id, cb);
            }
        });
    }

    changeLanguage(id, lng, cb) {
        let Guild = guildCache.get(id);
        Guild.lng = lng;
        guildCache.set(id, Guild);
        this.sendCacheUpdate(Guild);
        guildModel.update({id: id}, {$set: {lng: lng}}, cb);
    }

    changePrefix(id, prefix, cb) {
        let Guild = guildCache.get(id);
        Guild.prefix = prefix;
        guildCache.set(id, Guild);
        this.sendCacheUpdate(Guild);
        guildModel.update({id: id}, {$set: {prefix: prefix}}, cb);
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