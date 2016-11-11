/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The pause command,
 * pauses the current song
 * @extends Command
 *
 */
class Pause extends Command {
    /**
     * Create the pause command
     * @param {Function} t - the translation module
     */
    constructor(t,v) {
        super();
        this.cmd = "pause";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            msg.channel.sendMessage(err);
        });
        this.v.once('success', () => {
            msg.channel.sendMessage(':ok_hand: ');
        });
        this.v.pause(msg);
    }
}
module.exports = Pause;