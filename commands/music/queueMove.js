/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The QueueMove command, moves songs to different positions
 * @extends Command
 *
 */
class QueueMove extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "qm";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {

    }
}
module.exports = QueueMove;