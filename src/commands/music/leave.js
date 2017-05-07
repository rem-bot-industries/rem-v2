/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The leave command
 * @extends Command
 *
 */
class Leave extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'leave';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.aliases = ['disconnect'];
    }

    async run(msg) {
        try {
            await this.v.leave(msg);
            msg.channel.createMessage(this.t('leave', {lngs: msg.lang}));
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Leave;