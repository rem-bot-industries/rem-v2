/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The repeat command,
 * repeats the current song/the queue
 * @extends Command
 *
 */
class Repeat extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "repeat";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        let result = this.v.repeat(msg);
        msg.channel.createMessage(this.t(`np.emoji-repeat-${result}`, {lngs: msg.lang}));
    }
}
module.exports = Repeat;