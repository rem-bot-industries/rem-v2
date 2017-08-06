/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
let _ = require('lodash');
let version = require('../../../package.json').version;
let erisVersion = require('../../../node_modules/eris/package.json').version;
class BotInfo extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'bot';
        this.cat = 'misc';
        this.aliases = ['info', 'stats'];
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hub = mod.getMod('hub');
        this.v = mod.getMod('vm');
    }

    run(msg) {
        let user = rem.user;
        // let responseTimeout = setTimeout(() => {
        //
        // }, 10000);
        this.fetchData(msg).then(data => {
            // console.log(data);
            this.buildReply(msg, user, data);
        }).catch(data => {
            console.error(data);
            // console.error(data.badShards);
            let res = data.err === `Timeout!` ? `Timeout! Only ${Object.keys(data.shardData).length} Shards have responded! Missing Shards: ${Object.keys(data.badShards).join(', ')}` : 'kyaa >_<';
            msg.channel.createMessage(`:x: \`${res}\``);
        });
    }

    fetchData(msg) {
        return new Promise((resolve, reject) => {
            this.hub.on(`action_resolved_${msg.id}`, (data) => {
                if (data.err) reject(data);
                resolve(data);
            });
            this.hub.executeAction('bot_info', msg.id);
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
        moment.locale(msg.lang[0]);
        let fields = [];
        let guilds = 0;
        let users = 0;
        let channels = 0;
        let voice = 0;
        let voice_playing = 0;
        let shard_users = rem.guilds.map(g => g.memberCount).reduce((a, b) => a + b);
        let shard_guilds = rem.guilds.size;
        let shard_channels = rem.guilds.map(g => g.channels.size).reduce((a, b) => a + b);
        let shard_voice = this.v.getVoiceConnections();
        let shard_voice_playing = this.v.getVoiceConnections(true);
        _.forIn(data.shards, (value, key) => {
            guilds += value.guilds;
            users += value.users;
            channels += value.channels;
            voice += value.voice;
            voice_playing += value.voice_active;
        });
        fields.push({
            name: this.t('bot-info.uptime', {lngs: msg.lang}),
            value: moment().to(rem.startTime),
            inline: true
        });
        fields.push({name: this.t('generic.version', {lngs: msg.lang}), value: version, inline: true});
        fields.push({name: this.t('bot-info.made', {lngs: msg.lang}), value: 'Wolke, Dean, Veld', inline: true});
        fields.push({name: this.t('bot-info.lib', {lngs: msg.lang}), value: `Eris ${erisVersion}`, inline: true});
        fields.push({name: this.t('bot-info.guilds', {lngs: msg.lang}), value: guilds, inline: true});
        fields.push({name: this.t('bot-info.users', {lngs: msg.lang}), value: users, inline: true});
        fields.push({name: this.t('bot-info.channels', {lngs: msg.lang}), value: channels, inline: true});
        fields.push({
            name: `${this.t('bot-info.voice_active', {lngs: msg.lang})}/${this.t('bot-info.voice', {lngs: msg.lang})}`,
            value: `${voice_playing}/${voice}`,
            inline: true
        });
        fields.push({
            name: `${this.t('bot-info.voice_active', {lngs: msg.lang})}/${this.t('bot-info.voice', {lngs: msg.lang})} (${this.t('bot-info.shard', {lngs: msg.lang})})`,
            value: `${shard_voice_playing}/${shard_voice}`,
            inline: true
        });
        fields.push({name: this.t('bot-info.guilds-s', {lngs: msg.lang}), value: shard_guilds, inline: true});
        fields.push({name: this.t('bot-info.users-s', {lngs: msg.lang}), value: shard_users, inline: true});
        fields.push({name: this.t('bot-info.channels-s', {lngs: msg.lang}), value: shard_channels, inline: true});
        fields.push({
            name: this.t('bot-info.shard', {lngs: msg.lang}),
            value: `${rem.options.firstShardID + 1}/${rem.options.maxShards}`,
            inline: true
        });
        return fields;
    }
}
module.exports = BotInfo;
