/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The join command
 * @extends Command
 *
 */
class Join extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t,v) {
        super();
        this.cmd = "voice";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.join(msg, (err) => {
            if (err) return msg.reply(this.t(err, {lngs: msg.lang}));
            msg.reply(this.t('joinVoice.join', {lngs: message.lang}));
        });
    }
}
module.exports = Join;