/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The resume command,
 * resumes the current song
 * @extends Command
 *
 */
class Resume extends Command {
    /**
     * Create the resume command
     * @param {Function} t - the translation module
     */
    constructor(t, v) {
        super();
        this.cmd = "resume";
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
        this.v.resume(msg);
    }
}
module.exports = Resume;