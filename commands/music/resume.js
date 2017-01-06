/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The resume command,
 * resumes the current song
 * @extends Command
 *
 */
class Resume extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "resume";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(err);
        });
        this.v.once('success', () => {
            this.v.removeAllListeners();
            msg.channel.createMessage(':arrow_forward: ');
        });
        this.v.resume(msg);
    }
}
module.exports = Resume;