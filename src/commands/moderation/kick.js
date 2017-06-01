/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
const regs = {user: /<?(?:@|@!)([0-9]+)>/};
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class Kick extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'kick';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.kick.short',
            usage: 'help.kick.usage',
            example: 'help.kick.example'
        }
    }

    async run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (msgSplit.length === 0) {
            return msg.channel.createMessage(this.t('kick.no-mention', {lngs: msg.lang}));
        }
        msgSplit = msgSplit.map(m => m.trim());
        let target;
        let reason = '';
        for (let i = 0; i < msgSplit.length; i++) {
            if (regs.user.test(msgSplit[i])) {
                let split = msgSplit[i];
                if (split.startsWith('<@!')) {
                    split = split.substring(3);
                } else {
                    split = split.substring(2);
                }
                split = split.substring(0, split.length - 1);
                target = msg.guild.members.find(m => m.id === split);
                continue;
            }
            if (msgSplit[i] === '-r') {
                let index = msgSplit.indexOf('-r');
                reason = msgSplit.slice(index).join(' ');
                break;
            }
            if (!target) {
                let index = msgSplit.indexOf('-r');
                let user;
                if (index > -1) {
                    user = msgSplit.slice(0, index).join(' ');
                } else {
                    user = msgSplit.join(' ');
                }
                let users = utils.searchUser(msg.channel.guild.members, user);
                let pick = await searcher.userSearchMenu(msg, [user], this.t);
                if (pick === -1) {
                    return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                }
                if (pick === -2) {
                    return msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
                }
                if (pick > -1) {
                    target = users[pick];
                    break;
                }
            }
        }
        if (typeof(target) === 'undefined') {
            return msg.channel.createMessage(this.t('kick.no-mention', {lngs: msg.lang}));
        }
        if (reason === '') {
            reason = this.t('kick.default-reason', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator} (${target.user.id})`,
                mod: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`
            });
        }
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.member, msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('kick.privilege', {lngs: msg.lang}));
        }
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.channel.guild.members.find(m => m.id === rem.user.id), msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('kick.privilege_self', {lngs: msg.lang}));
        }
        try {
            target.kick(reason);
        } catch(e) {

        }
    }
}
module.exports = Kick;