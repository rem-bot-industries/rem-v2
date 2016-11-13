/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
/**
 * The addToQueueCommand
 * @extends Command
 *
 */
class AddToQueue extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t,v) {
        super();
        this.cmd = "qa";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            // console.log(err);
            msg.channel.sendMessage(this.t(err));
        });
        this.v.once('info', (info, url) => {
            // console.log(err);
            msg.channel.sendMessage(this.t(info, {url: url}));
        });
        this.v.addToQueue(msg, false);
        setTimeout(() => {
            this.v.removeListener('info');
        }, 2000);
    }
}
module.exports = AddToQueue;