/**
 * Created by Julian/Wolke on 07.11.2016.
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
        this.cmd = 'resume';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    async run(msg) {
        try {
            this.v.resume(msg);
            msg.channel.createMessage(':arrow_forward: ');
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Resume;