/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let Selector = require('../../structures/selector');
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
    constructor({t, v}) {
        super();
        this.cmd = "qa";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once(`${msg.id}_error`, (err) => {
            this.clearListeners();
            console.error(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_info`, (info, url) => {
            // this.clearListeners();
            msg.channel.createMessage(this.t(info, {url: url, lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_added`, (Song) => {
            this.clearListeners();
            msg.channel.createMessage(this.t('qa.success', {song: Song.title, lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_search-result`, (results) => {
            let selector = new Selector(msg, results, this.t, (err, number) => {
                if (err) {
                    this.clearListeners();
                    return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                }
                msg.content = `https://youtube.com/watch?v=${results[number - 1].id}`;
                setTimeout(() => {
                    this.clearListeners();
                }, 3000);
                this.v.addToQueue(msg, false);
            });
        });
        this.v.addToQueue(msg, false);
        setTimeout(() => {
            this.v.removeListener(`${msg.id}_info`);
            this.v.removeListener(`${msg.id}_search-result`);
        }, 3000);
    }

    clearListeners() {
        this.v.removeAllListeners();
    }
}
module.exports = AddToQueue;