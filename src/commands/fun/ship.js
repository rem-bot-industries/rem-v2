/**
 * Created by Wolke on 06.06.2017.
 */
let Command = require('../../structures/command');
const regs = {user: /<?(?:@|@!)([0-9]+)>/};
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class Ship extends Command {
    constructor({t}) {
        super();
        this.cat = 'fun';
        this.cmd = 'ship';
        this.needGuild = true;
        this.t = t;
        this.help = {
            short: 'help.ship.short',
            usage: 'help.ship.usage',
            example: 'help.ship.example'
        }
    }

    async run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        // console.log(msgSplit);
        if (msgSplit.length === 0) {
            return msg.channel.createMessage(this.t('ship.single', {
                lngs: msg.lang,
                user: msg.member.nick ? msg.member.nick : msg.author.username
            }));
        }
        let targets = {t1: msg.member, t2: undefined};
        for (let i = 0; i < msgSplit.length; i++) {
            if (regs.user.test(msgSplit[i])) {
                let id = "";
                if (msgSplit[i].startsWith('<@!')) {
                    id = msgSplit[i].substring(3);
                } else {
                    id = msgSplit[i].substring(2);
                }
                id = id.substring(0, id.length - 1);
                if (targets.t2 === undefined) {
                    targets.t2 = msg.channel.guild.members.find(m => m.user.id === id);
                } else {
                    targets.t1 = msg.channel.guild.members.find(m => m.user.id === id);
                }
            } else {
                let users = utils.searchUser(msg.channel.guild.members, msgSplit[i]);
                let pick = await searcher.userSearchMenu(msg, [msgSplit[i]], this.t);
                if (pick === -1) {
                    return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                }
                if (pick === -2) {
                    return msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
                }
                if (pick > -1) {
                    let targetUser = users[pick];
                    if (targets.t2 === undefined) {
                        targets.t2 = targetUser
                    } else {
                        targets.t1 = targetUser
                    }
                }
            }
        }
        if (!targets.t2) {
            return msg.channel.createMessage(this.t('ship.single', {
                lngs: msg.lang,
                user: msg.member.nick ? msg.member.nick : msg.author.username
            }));
        }
        if (targets.t1.user.id === targets.t2.user.id) {
            return msg.channel.createMessage(this.t('ship.single', {
                lngs: msg.lang,
                user: msg.member.nick ? msg.member.nick : msg.author.username
            }));
        }
        let shipname = this.getShipname(targets);
        return msg.channel.createMessage(this.t('ship.success', {lngs: msg.lang, shipname}))
    }

    getShipname(targets) {
        let firstTarget = Math.floor(Math.random() * 100) > 49;
        let name = "";
        let t1Name = targets.t1.nick ? targets.t1.nick : targets.t1.user.username;
        let t2Name = targets.t2.nick ? targets.t2.nick : targets.t2.user.username;
        if (firstTarget) {
            name = t1Name.substring(0, Math.floor(t1Name.length / 2));
            name += t2Name.substring(Math.floor(t2Name.length / 2));
        } else {
            name = t2Name.substring(0, Math.floor(t2Name.length / 2));
            name += t1Name.substring(Math.floor(t1Name.length / 2));
        }
        return name;
    }
}
module.exports = Ship;