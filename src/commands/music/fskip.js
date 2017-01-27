/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The force skip command
 * @extends Command
 *
 */
class ForceSkip extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'fskip';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        let args = msg.content.split(' ').splice(1);
        if (args[0]) {
            this.v.forceSkip(msg, args[0]).then(res => {
                msg.channel.createMessage(this.t(res.t, {lngs: msg.lang, title: res.title, amount: res.amount}));
            }).catch(err => {
                console.log(err);
                msg.channel.createMessage(this.t(err.t ? err.t : 'generic.error', {lngs: msg.lang}));
            });
        } else {
            this.v.forceSkip(msg).then(res => {
                msg.channel.createMessage(this.t(res.t, {lngs: msg.lang, title: res.title}));
            }).catch(err => {
                msg.channel.createMessage(this.t(err.t, {lngs: msg.lang}));
            });
        }
    }
}
module.exports = ForceSkip;