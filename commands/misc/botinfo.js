/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
let _ = require("lodash");
class BotInfo extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "bot";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hub = mod.getMod('hub');
    }

    run(msg) {
        let user = rem.user;
        this.fetchData(msg).then(data => {
            // console.log(data);
            this.buildReply(msg, user, data);
        }).catch(err => {
            console.error(err);
            let res = err === 'Timeout!' ? err : 'kyaa >_<';
            msg.channel.createMessage(`:x: \`${res}\``)
        });
    }

    fetchData(msg) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.hub.emitRemote('request_data', {sid: rem.options.firstShardID, id: msg.id, action: 'bot_info'});
            that.hub.on(`resolved_data_${msg.id}`, (data) => {
                if (data.err) reject(data.err);
                resolve(data);
            });
        });

    }

    buildReply(msg, user, data) {
        let reply = {
            embed: {
                author: {
                    name: `${user.username}`,
                    icon_url: user.avatarURL
                },
                fields: this.buildBotInfo(msg, data),
                color: 0x00ADFF
            }
        };
        msg.channel.createMessage(reply).then().catch(err => {
            // console.error(err);
        });
    }

    buildBotInfo(msg, data) {
        let fields = [];
        let guilds = 0;
        let users = 0;
        let channels = 0;
        let shard_users = rem.guilds.map(g => g.memberCount).reduce((a, b) => a + b);
        let shard_guilds = rem.guilds.size;
        let shard_channels = rem.guilds.map(g => g.channels.size).reduce((a, b) => a + b);
        _.forIn(data, (value, key) => {
            guilds += value.data.guilds;
            users += value.data.users;
            channels += value.data.channels;
        });
        fields.push({
            name: this.t('bot-info.uptime', {lngs: msg.lang}),
            value: moment().to(rem.startTime),
            inline: true
        });
        fields.push({name: this.t('bot-info.made', {lngs: msg.lang}), value: `Wolke#6746`, inline: true});
        fields.push({name: this.t('bot-info.lib', {lngs: msg.lang}), value: `Eris V0.5.1`, inline: true});
        fields.push({name: this.t('bot-info.guilds', {lngs: msg.lang}), value: guilds, inline: true});
        fields.push({name: this.t('bot-info.users', {lngs: msg.lang}), value: users, inline: true});
        fields.push({name: this.t('bot-info.channels', {lngs: msg.lang}), value: channels, inline: true});
        fields.push({name: this.t('bot-info.guilds-s', {lngs: msg.lang}), value: shard_guilds, inline: true});
        fields.push({name: this.t('bot-info.users-s', {lngs: msg.lang}), value: shard_users, inline: true});
        fields.push({name: this.t('bot-info.channels-s', {lngs: msg.lang}), value: shard_channels, inline: true});
        fields.push({name: `Donate`, value: `[patreon.com/rem_bot](https://www.patreon.com/rem_bot)`, inline: true});
        fields.push({name: `Support`, value: `[ram.moe/support](https://ram.moe/support)`, inline: true});
        fields.push({name: `Invite`, value: `[ram.moe/invite](https://ram.moe/invite)`, inline: true});
        fields.push({
            name: this.t('bot-info.shard', {lngs: msg.lang}),
            value: `${rem.options.firstShardID + 1}/${rem.options.maxShards}`,
            inline: true
        });
        return fields;
    }
}
module.exports = BotInfo;