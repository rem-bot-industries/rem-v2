/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The force skip command
 * @extends Command
 *
 */
class ForceSkip extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "fskip";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once(`${msg.id}_error`, (err) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_skipped`, (song) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t('skip.success', {lngs: msg.lang, title: song.title}));
        });
        this.v.forceSkip(msg);
    }
}
module.exports = ForceSkip;