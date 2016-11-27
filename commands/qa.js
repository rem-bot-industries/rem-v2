/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
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
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            this.clearListeners();
            console.log(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once('info', (info, url) => {
            // this.clearListeners();
            msg.channel.createMessage(this.t(info, {url: url, lngs: msg.lang}));
        });
        this.v.once('added', (Song) => {
            this.clearListeners();
            msg.channel.createMessage(this.t('qa.success', {song: Song.title, lngs: msg.lang}));
        });
        this.v.addToQueue(msg, false);
        setTimeout(() => {
            this.v.removeListener('info');
        }, 2000);
    }

    clearListeners() {
        this.v.removeAllListeners();
    }
}
module.exports = AddToQueue;