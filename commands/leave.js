/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The leave command
 * @extends Command
 *
 */
class Leave extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t, v) {
        super();
        this.cmd = "leave";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.leave(msg, (err) => {
            if (err) return msg.reply(this.t(err, {lngs: msg.lang}));
            msg.channel.sendMessage(this.t('leave', {lngs: msg.lang}));
        });
    }
}
module.exports = Leave;