/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
class ServerInfo extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "sinfo";
        this.cat = "misc";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.g = mod.getMod('gm');
    }

    run(msg) {
        this.buildReply(msg);
    }

    buildReply(msg) {
        let avatar = msg.guild.iconURL;
        this.g.loadGuild(msg.guild.id, (err, dbGuild) => {
            if (err) return winston.error(err);
            let reply = {
                embed: {
                    author: {
                        name: msg.guild.name,
                        icon_url: avatar
                    },
                    fields: this.buildGuildInfo(msg, dbGuild),
                    image: {url: avatar},
                    color: 0x00ADFF
                }
            };
            msg.channel.createMessage(reply);
        });
    }

    buildGuildInfo(msg, dbGuild) {
        let fields = [];
        let guild = msg.guild;
        let voice = guild.channels.filter(c => c.type === 2);
        let owner = msg.guild.members.find(m => m.id === guild.ownerID);
        fields.push({name: this.t('server-info.id', {lngs: msg.lang}), value: guild.id, inline: true});
        fields.push({name: this.t('server-info.name', {lngs: msg.lang}), value: guild.name, inline: true});
        fields.push({
            name: this.t('user-info.created', {lngs: msg.lang}),
            value: moment().to(guild.createdAt),
            inline: true
        });
        fields.push({name: this.t('server-info.member', {lngs: msg.lang}), value: guild.memberCount, inline: true});
        fields.push({
            name: this.t('server-info.text', {lngs: msg.lang}),
            value: guild.channels.filter(c => c.type === 0).length,
            inline: true
        });
        fields.push({
            name: this.t('server-info.voice', {lngs: msg.lang}),
            value: guild.channels.filter(c => c.type === 2).length,
            inline: true
        });
        fields.push({name: this.t('server-info.roles', {lngs: msg.lang}), value: guild.roles.size, inline: true});
        fields.push({
            name: this.t('server-info.owner', {lngs: msg.lang}),
            value: owner ? `${owner.user.username}#${owner.user.discriminator}` : ':x: ',
            inline: true
        });
        return fields;
    }
}
module.exports = ServerInfo;