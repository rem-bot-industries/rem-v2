/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The shuffle command, it shuffles the queue
 * @extends Command
 *
 */
class Shuffle extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'shuffle';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.shuffle(msg).then(res => {
            msg.channel.createMessage(this.t(res.t, {lngs: msg.lang}));
        }).catch(err => {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        });
    }
}
module.exports = Shuffle;