/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
let moment = require('moment');
class UserInfo extends Command {
    constructor(t) {
        super();
        this.cmd = "uinfo";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.msg = null;
    }

    run(msg) {
        this.msg = msg;
        let user;
        let member;
        if (msg.mentions.length > 0) {
            user = msg.mentions[0];
            member = msg.guild ? msg.guild.members.find(u => u.id === user.id) : null;
            this.buildReply(msg, user, member);
        } else {
            user = msg.author;
            member = msg.guild ? msg.member : null;
            this.buildReply(msg, user, member);
        }
    }

    buildReply(msg, user, member) {
        let avatar = user.avatarURL ? user.avatarURL : user.defaultAvatarURL;
        let reply = {
            embed: {
                author: {
                    name: `${this.t('user-info.info', {lngs: msg.lang})}: ${user.username}#${user.discriminator}`,
                    icon_url: avatar
                },
                fields: this.buildUserInfo(user, member),
                image: {url: avatar},
                color: 0x00ADFF
            }
        };
        msg.channel.createMessage(reply);
    }

    buildUserInfo(user, member) {
        let fields = [];
        fields.push({name: this.t('user-info.id', {lngs: this.msg.lang}), value: user.id, inline: true});
        fields.push({name: this.t('user-info.name', {lngs: this.msg.lang}), value: user.username, inline: true});
        fields.push({
            name: this.t('user-info.discriminator', {lngs: this.msg.lang}),
            value: user.discriminator,
            inline: true
        });
        fields.push({
            name: this.t('user-info.created', {lngs: this.msg.lang}),
            value: moment().to(user.createdAt),
            inline: true
        });
        if (member) {
            if (member.nick) {
                fields.push({name: this.t('user-info.nick', {lngs: this.msg.lang}), value: member.nick, inline: true});
            }
            fields.push({name: this.t('user-info.status', {lngs: this.msg.lang}), value: member.status, inline: true});
            if (member.game) {
                fields.push({
                    name: this.t('user-info.playing', {lngs: this.msg.lang}),
                    value: member.game.name,
                    inline: true
                });
            }
            fields.push({
                name: this.t('user-info.join', {lngs: this.msg.lang}),
                value: moment().to(member.joinedAt),
                inline: true
            });
            fields.push({
                name: this.t('user-info.role', {lngs: this.msg.lang}),
                value: member.roles.length,
                inline: true
            });
        }
        fields.push({
            name: this.t('user-info.bot', {lngs: this.msg.lang}),
            value: user.bot ? ':white_check_mark: ' : ':x: ',
            inline: true
        });
        return fields;
    }
}
module.exports = UserInfo;