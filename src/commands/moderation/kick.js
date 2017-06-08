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
        //Split the args
        let msgSplit = msg.content.split(' ').splice(1);
        //Give an error if no args are passed
        if (msgSplit.length === 0) {
            return msg.channel.createMessage(this.t('kick.no-mention', {lngs: msg.lang}));
        }
        //Check if rem has perms to kick users
        let remMember = msg.channel.guild.members.find(m => m.user.id === rem.user.id);
        if (!remMember.permission.has('kickMembers')) {
            return msg.channel.createMessage(this.t('kick.privilege_self_discord', {
                lngs: msg.lang
            }));
        }
        msgSplit = msgSplit.map(m => m.trim());
        let target;
        let reason = '';
        //Parse the arguments
        for (let i = 0; i < msgSplit.length; i++) {
            //check mentions
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
            //parse the reason if added
            if (msgSplit[i] === '-r') {
                let index = msgSplit.indexOf('-r');
                if (index === msgSplit.length - 1) {
                    break;
                }
                reason = msgSplit.slice(index + 1).join(' ');
                break;
            }
            //if there was no mention found so far, check
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
                }
            }
        }
        //if there was no target found
        if (typeof(target) === 'undefined') {
            return msg.channel.createMessage(this.t('kick.no-mention', {lngs: msg.lang}));
        }
        //if the user tries to kick themselves
        if (target.user.id === msg.author.id) {
            return msg.channel.createMessage(this.t('kick.self-user', {lngs: msg.lang}))
        }
        //if the user tries to kick the owner
        if (target.user.id === msg.channel.guild.ownerID) {
            return msg.channel.createMessage(this.t('kick.privilege_owner', {lngs: msg.lang}));
        }
        //add a reason if there was no reason passed
        if (reason === '') {
            reason = this.t('kick.default-reason', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator} (${target.user.id})`,
                mod: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`
            });
        } else {
            reason = this.t('kick.reason', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator} (${target.user.id})`,
                mod: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                reason: reason
            });
        }
        //check if the role of the user is higher than the role of the user he want's to kick
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.member, msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('kick.privilege', {lngs: msg.lang}));
        }
        //check if rem's role is higher than the role of the user that should be kicked
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.channel.guild.members.find(m => m.id === rem.user.id), msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('kick.privilege_self', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator}`
            }));
        }
        //actually kick the user
        try {
            await target.kick(reason);
            return msg.channel.createMessage(this.t('kick.success', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator}`
            }));
        } catch (e) {
            //if the error is a priv error, show it to the user
            console.error(e.getMessage());
            if (e.resp.statusCode === 403) {
                return msg.channel.createMessage(this.t('kick.privilege_self', {
                    lngs: msg.lang,
                    user: `${target.user.username}#${target.user.discriminator}`
                }));
            }
            //return a generic error
            return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Kick;