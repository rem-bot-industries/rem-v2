/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The QueueMove command, moves songs to different positions
 * @extends Command
 *
 */
class QueueRemove extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'qr';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.aliases = ['queueRemove']
    }

    run(msg) {
        let args = msg.content.split(' ').splice(1);
        if (args[0]) {
            this.v.queueRemove(msg, args[0]).then(res => {
                msg.channel.createMessage(this.t(res.t, {lngs: msg.lang, number: res.number, title: res.title}));
            }).catch(err => {
                console.error(err);
                msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
            });
        } else {
            msg.channel.createMessage(this.t('qra.no-number', {lngs: msg.lang}));
        }
    }
}
module.exports = QueueRemove;