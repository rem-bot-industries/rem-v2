/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
let _ = require("lodash");
let adminId = require('../../config/main.json').owner_id;
class GuildFinder extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "findGuild";
        this.cat = "admin";
        this.hidden = true;
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 2;
        this.hub = mod.getMod('hub');
    }

    run(msg) {
        if (msg.author.id === adminId) {
            let id = msg.content.split(' ').splice(1)[0];
            if (id) {
                this.fetchData(msg, id).then(data => {
                    // console.log(data);
                    this.buildReply(msg, data);
                }).catch(err => {
                    console.error(err);
                    msg.channel.createMessage(`:x: \`${err}\``)
                });
            }
        }
    }

    fetchData(msg, id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.hub.emitRemote('request_data', {
                sid: rem.options.firstShardID,
                id: msg.id,
                action: 'guild_info_id',
                guild_id: id
            });
            that.hub.on(`resolved_data_${msg.id}`, (data) => {
                if (data.err) reject(data.err);
                let guild;
                try {
                    _.forIn(data, (value, key) => {
                        if (value.data.found) {
                            guild = value.data;
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
                if (guild) {
                    resolve(guild);
                } else {
                    resolve({name: `Not Found ${id}`, found: false})
                }
            });
        });

    }

    buildReply(msg, data) {
        let reply = {
            embed: {
                author: {
                    name: `${data.name}`
                },
                fields: this.buildGuildInfo(msg, data),
                color: 0x00ADFF
            }
        };
        if (data.found) {
            reply.embed.image = {url: data.iconURL};
        }
        msg.channel.createMessage(reply).then().catch(err => {
            // console.error(err);
        });
    }

    buildGuildInfo(msg, guild) {
        let fields = [];
        if (guild.found) {
            fields.push({name: this.t('server-info.id', {lngs: msg.lang}), value: guild.id, inline: true});
            fields.push({name: this.t('server-info.name', {lngs: msg.lang}), value: guild.name, inline: true});
            fields.push({
                name: this.t('user-info.created', {lngs: msg.lang}),
                value: moment().to(guild.createdAt),
                inline: true
            });
            fields.push({name: this.t('server-info.member', {lngs: msg.lang}), value: guild.memberCount, inline: true});
            fields.push({
                name: this.t('server-info.owner', {lngs: msg.lang}),
                value: guild.owner ? `${guild.owner.username}#${guild.owner.discriminator}` : ':x: ',
                inline: true
            });
            fields.push({name: 'Shard', value: guild.sid, inline: true});
            fields.push({name: 'VoiceRegion', value: guild.region, inline: true});
        } else {
            fields.push({name: 'uwu', value: 'uwu'});
        }
        return fields;
    }
}
module.exports = GuildFinder;