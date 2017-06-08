/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
const regs = {user: /<?(?:@|@!)([0-9]+)>/};
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class Ban extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'ban';
        this.aliases = ['b', 'banne'];
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.ban.short',
            usage: 'help.ban.usage',
            example: 'help.ban.example'
        }
    }

    async run(msg) {
        //Split the args
        let msgSplit = msg.content.split(' ').splice(1);
        //Give an error if no args are passed
        if (msgSplit.length === 0) {
            return msg.channel.createMessage(this.t('ban.no-mention', {lngs: msg.lang}));
        }
        //Check if rem has perms to ban users
        let remMember = msg.channel.guild.members.find(m => m.user.id === rem.user.id);
        if (!remMember.permission.has('banMembers')) {
            return msg.channel.createMessage(this.t('ban.privilege_self_discord', {
                lngs: msg.lang
            }));
        }
        msgSplit = msgSplit.map(m => m.trim());
        let target;
        let reason = '';
        let deleteDays = 7;
        //Parse the arguments
        //parse the time
        if (msgSplit.indexOf('-t') > -1 && msgSplit.indexOf('-t') < msgSplit.length - 1) {
            let index = msgSplit.indexOf('-t');
            let days = 0;
            let time = msgSplit[index + 1];
            if (time.endsWith('d') && time.length === 2) {
                time = time.substring(0, 1)
            }
            try {
                days = parseInt(time);
                if (!isNaN(days) && days > -1 && days < 8) {
                    deleteDays = days;
                    msgSplit.splice(index, 2)
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (msgSplit.indexOf('-r') > -1 && msgSplit.indexOf('-r') < msgSplit.length - 1) {
            let index = msgSplit.indexOf('-r');
            reason = msgSplit.splice(index + 1).join(' ');
        }
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
            return msg.channel.createMessage(this.t('ban.no-mention', {lngs: msg.lang}));
        }
        //if the user tries to ban themselves
        if (target.user.id === msg.author.id) {
            return msg.channel.createMessage(this.t('ban.self-user', {lngs: msg.lang}))
        }
        //if the user tries to ban the owner
        if (target.user.id === msg.channel.guild.ownerID) {
            return msg.channel.createMessage(this.t('ban.privilege_owner', {lngs: msg.lang}));
        }
        //add a reason if there was no reason passed
        if (reason === '') {
            reason = this.t('ban.default-reason', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator} (${target.user.id})`,
                mod: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`
            });
        } else {
            reason = this.t('ban.reason', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator} (${target.user.id})`,
                mod: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                reason: reason
            });
        }
        //check if the role of the user is higher than the role of the user he want's to ban
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.member, msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('ban.privilege', {lngs: msg.lang}));
        }
        //check if rem's role is higher than the role of the user that should be baned
        if (utils.getHighestRolePosition(target, msg.channel.guild.roles) > utils.getHighestRolePosition(msg.channel.guild.members.find(m => m.id === rem.user.id), msg.channel.guild.roles)) {
            return msg.channel.createMessage(this.t('ban.privilege_self', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator}`
            }));
        }
        //actually ban the user
        try {
            await target.ban(deleteDays, reason);
            return msg.channel.createMessage(this.t('ban.success', {
                lngs: msg.lang,
                user: `${target.user.username}#${target.user.discriminator}`
            }));
        } catch (e) {
            //if the error is a priv error, show it to the user
            console.error(e.getMessage());
            if (e.resp.statusCode === 403) {
                return msg.channel.createMessage(this.t('ban.privilege_self', {
                    lngs: msg.lang,
                    user: `${target.user.username}#${target.user.discriminator}`
                }));
            }
            //return a generic error
            return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Ban;