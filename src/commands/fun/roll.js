/**
 * Created by Julian/Wolke on 15.11.2016.
 */
let Command = require('../../structures/command');
class Roll extends Command {
    constructor({t}) {
        super();
        this.cmd = 'roll';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    run(msg) {
        let messageSplit = msg.content.split(' ');
        let number = 10;
        if (typeof (messageSplit[1]) !== 'undefined') {
            try {
                number = parseInt(messageSplit[1]);
            } catch (e) {
                return msg.channel.createMessage(this.t('generic.whole-num', {lngs: msg.lang}));
            }
            if (isNaN(number)) {
                return msg.channel.createMessage(this.t('generic.nan', {lngs: msg.lang}));
            }
            if (number < 1) {
                return msg.channel.createMessage(this.t('roll.negative', {number: number, lngs: msg.lang}));
            }
        }
        msg.channel.createMessage(this.t('roll.success', {
            first: this.random(1, number),
            second: number,
            lngs: msg.lang
        }));
    }
}
module.exports = Roll;