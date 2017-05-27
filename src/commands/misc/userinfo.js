/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class UserInfo extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'uinfo';
        this.cat = 'misc';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.u = mod.getMod('um');
        this.aliases = ['userinfo'];
    }

    async run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let user;
        let member;
        if (msg.mentions.length > 0) {
            user = msg.mentions[0];
            member = msg.channel.guild ? msg.channel.guild.members.find(u => u.id === user.id) : null;
            this.buildReply(msg, user, member);
        } else if (messageSplit.length > 0) {
            let users = utils.searchUser(msg.channel.guild.members, messageSplit.join(' '));
            let pick = await searcher.userSearchMenu(msg, messageSplit, this.t);
            if (pick === -1) {
                return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
            }
            if (pick === -2) {
                return msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
            }
            if (pick > -1) {
                member = users[pick];
                user = member.user;
                this.buildReply(msg, user, member);
            }
        } else {
            user = msg.author;
            member = msg.channel.guild ? msg.member : null;
            this.buildReply(msg, user, member);
        }
    }

    async buildReply(msg, user, member) {
        let avatar = user.avatar ? (user.avatar.startsWith('a_') ? `​https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif` : `​https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`) : user.defaultAvatarURL;
        avatar = avatar.replace(/[^a-zA-Z0-9_\-./:]/, '');
        avatar += '?size=1024';
        try {
            let dbUser = await this.u.loadUser(user);
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
                console.error(err);
            });
        } catch (e) {
            return winston.error(e);
        }

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