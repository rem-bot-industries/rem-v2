/**
 * Created by julia on 06.12.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let moment = require('moment');
class Love extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "love";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.u = mod.getMod('um');
        this.accessLevel = 0;
    }

    run(msg) {
        if (this.u.checkLoveCD(msg.dbUser)) {
            if (msg.mentions.length > 0) {
                if (msg.mentions[0].id === msg.author.id) {
                    return msg.channel.createMessage(this.t('love.self', {lngs: msg.lang}));
                }
                let msgSplit = msg.content.split(' ').splice(1);
                let inc = this.checkMsg(msgSplit) ? 1 : -1;
                let target = msg.mentions[0];
                this.u.love(target, inc, (err) => {
                    if (err) {
                        winston.error(err);
                        return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                    }
                    this.u.addLoveCd(msg.dbUser, (err, reps) => {
                        if (err) return winston.error(err);
                        let lowest = Math.min(...reps);
                        let reply = this.t('love.success', {
                            lngs: msg.lang,
                            target: target.username,
                            rep: inc,
                            uses: 2 - reps.length
                        });
                        if (reps.length === 2) {
                            reply += this.t('love.next', {lngs: msg.lang, time: moment().to(lowest)});
                        }
                        msg.channel.createMessage(reply);
                    });
                });

            } else {
                msg.channel.createMessage(this.t('generic.mention', {lngs: msg.lang}));
            }
        } else {
            let lowest = Math.min(...msg.dbUser.reps);
            msg.channel.createMessage(this.t('love.error-cd', {lngs: msg.lang, time: moment().to(lowest)}));
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