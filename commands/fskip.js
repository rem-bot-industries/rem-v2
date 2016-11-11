/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The addToQueueCommand
 * @extends Command
 *
 */
class ForceSkip extends Command {
    /**
     * Create the pause command
     * @param {Function} t - the translation module
     */
    constructor(t, v) {
        super();
        this.cmd = "fskip";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {

        });
        this.v.forceSkip(msg);
    }
}
module.exports = ForceSkip;