/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The pause command,
 * pauses the current song
 * @extends Command
 *
 */
class Pause extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'pause';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;

    }

    run(msg) {
        try {
            this.v.pause(msg);
            msg.channel.createMessage(':pause_button: ');
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Pause;