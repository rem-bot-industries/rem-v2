/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let util = require('util');
/**
 * The Now Playing command,
 * shows the current queue
 * @extends Command
 *
 */
class NowPlaying extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'np';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.aliases = ['nowPlaying'];
    }

    /**
     * The main function of the command
     * @param msg
     */
    async run (msg) {
        try {
            let queue = await this.v.getQueue(msg.channel.guild.id);
            msg.channel.createMessage(this.buildReply(queue, msg));
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }

    /**
     * Builds the reply
     * @param Queue - the queue object
     * @param msg - the message that triggered the command
     * @returns {String} The Reply
     */
    buildReply(Queue, msg) {
        let reply = '';
        let repeat = Queue.repeat !== 'off' ? this.t(`np.repeat-${Queue.repeat}`, {lngs: msg.lang}) : '';
        if (Queue.songs[0].duration && Queue.songs[0].duration !== '') {
            reply = reply + `${this.t('np.song-duration', {
                    lngs: msg.lang,
                    title: Queue.songs[0].title,
                    repeat: repeat,
                    duration: Queue.songs[0].duration,
                    current: Queue.time,
                    interpolation: {escape: false},
                    user: Queue.songs[0].queuedBy ? Queue.songs[0].queuedBy : '-'
                })} \n`;
        } else {
            reply = reply + `${this.t('np.song', {
                    lngs: msg.lang,
                    title: Queue.songs[0].title,
                    repeat: repeat,
                    interpolation: {escape: false},
                    user: Queue.songs[0].queuedBy ? Queue.songs[0].queuedBy : '-'
                })}\n`;
        }
        return reply;
    }
}
module.exports = NowPlaying;