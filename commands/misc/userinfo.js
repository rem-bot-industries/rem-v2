/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
class UserInfo extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "uinfo";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.u = mod.getMod('um');
    }

    run(msg) {
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
        let avatar = user.avatar ? (user.avatar.startsWith('a_') ? `​https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif` : user.avatarURL) : user.defaultAvatarURL;
        avatar = avatar.replace(/[^a-zA-Z0-9_\-./:]/, "");
        this.u.loadUser(user, (err, dbUser) => {
            if (err) return winston.error(err);
            let reply = {
                embed: {
                    author: {
                        name: `${this.t('user-info.info', {lngs: msg.lang})}: ${user.username}#${user.discriminator}`,
                        icon_url: avatar
                    },
                    fields: this.buildUserInfo(msg, user, member, dbUser),
                    image: {url: avatar},
                    color: 0x00ADFF
                }
            };
            msg.channel.createMessage(reply).then().catch(err => {
                // console.error(err);
            });
        });
    }

    buildUserInfo(msg, user, member, dbUser) {
        let fields = [];
        fields.push({name: this.t('user-info.id', {lngs: msg.lang}), value: user.id, inline: true});
        fields.push({name: this.t('user-info.name', {lngs: msg.lang}), value: user.username, inline: true});
        fields.push({
            name: this.t('user-info.discriminator', {lngs: msg.lang}),
            value: user.discriminator,
            inline: true
        });
        fields.push({
            name: this.t('user-info.created', {lngs: msg.lang}),
            value: moment().to(user.createdAt),
            inline: true
        });
        if (member) {
            if (member.nick) {
                fields.push({name: this.t('user-info.nick', {lngs: msg.lang}), value: member.nick, inline: true});
            }
            fields.push({name: this.t('user-info.status', {lngs: msg.lang}), value: member.status, inline: true});
            if (member.game) {
                fields.push({
                    name: this.t('user-info.playing', {lngs: msg.lang}),
                    value: member.game.name,
                    inline: true
                });
            }
            fields.push({
                name: this.t('user-info.join', {lngs: msg.lang}),
                value: moment().to(member.joinedAt),
                inline: true
            });
            fields.push({
                name: this.t('user-info.role', {lngs: msg.lang}),
                value: member.roles.length,
                inline: true
            });
        }
        fields.push({
            name: 'LP',
            value: dbUser.rep,
            inline: true
        });
        fields.push({
            name: this.t('user-info.bot', {lngs: msg.lang}),
            value: user.bot ? ':white_check_mark: ' : ':x: ',
            inline: true
        });
        return fields;
    }
}
module.exports = UserInfo;