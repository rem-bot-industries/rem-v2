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
        this.aliases = ['forceSkip'];
    }

    async run(msg) {
        let args = msg.content.split(' ').splice(1);
        try {
            let res = await this.v.forceSkip(msg, args[0]);
            msg.channel.createMessage(this.t(res.t, {lngs: msg.lang, title: res.title, amount: res.amount}));
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = ForceSkip;