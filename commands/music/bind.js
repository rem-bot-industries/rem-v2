/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
/**
 * The bind command,
 * binds Rem to a channel
 * @extends Command
 *
 */
class Bind extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t, v) {
        super();
        this.cmd = "bind";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.bind(msg, (res) => {
            msg.channel.createMessage(res ? ':white_check_mark: ' : ':x: ');
        });
    }
}
module.exports = Bind;