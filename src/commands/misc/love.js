/**
 * Created by Julian/Wolke on 06.12.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let moment = require('moment');
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class Love extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'love';
        this.cat = 'misc';
        this.needGuild = false;
        this.t = t;
        this.u = mod.getMod('um');
        this.accessLevel = 0;
    }

    async run(msg) {
        let time = moment();
        time.locale(msg.lang[0]);
        let msgSplit = msg.content.split(' ').splice(1);
        if (this.u.checkLoveCD(msg.dbUser)) {
            let targetMember;
            if (msg.mentions.length > 0) {
                if (msg.mentions[0].id === msg.author.id) {
                    return msg.channel.createMessage(this.t('love.self', {lngs: msg.lang}));
                }
                targetMember = msg.mention[0];
            } else if (msgSplit.length > 0) {
                let msgSplitFilter = msgSplit.filter((m) => m !== '-');
                let users = utils.searchUser(msg.channel.guild.members, msgSplitFilter.join(' '));
                let pick = await searcher.userSearchMenu(msg, msgSplitFilter, this.t);
                if (pick === -1) {
                    return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                }
                if (pick === -2) {
                    return msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
                }
                if (pick > -1) {
                    targetMember = users[pick];
                }
            } else {
                return msg.channel.createMessage(this.t('generic.mention', {lngs: msg.lang}));
            }
            let inc = this.checkMsg(msgSplit) ? 1 : -1;
            let target = targetMember;
            try {
                await this.u.love(target, inc);
                let reps = await this.u.addLoveCd(msg.dbUser);
                let lowest = Math.min(...reps);
                let reply;
                if (inc === 1) {
                    reply = this.t('love.success', {
                        lngs: msg.lang,
                        target: target.username,
                        rep: inc,
                        uses: 2 - reps.length
                    });
                } else {
                    reply = this.t('love.success-remove', {
                        lngs: msg.lang,
                        target: target.username,
                        rep: inc,
                        uses: 2 - reps.length
                    });
                }
                if (reps.length === 2) {
                    reply += this.t('love.next', {lngs: msg.lang, time: time.to(lowest)});
                }
                msg.channel.createMessage(reply);
            } catch (e) {
                winston.error(e);
                return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
        } else {
            let lowest = Math.min(...msg.dbUser.reps);
            msg.channel.createMessage(this.t('love.error-cd', {lngs: msg.lang, time: time.to(lowest)}));
        }
    }

    checkMsg(msgSplit) {
        for (let i = 0; i < msgSplit.length; i++) {
            if (msgSplit[i] === '-') {
                return false;
            }
        }
        return true;
    }

}
module.exports = Love;