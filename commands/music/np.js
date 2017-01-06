/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let util = require("util");
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
        this.cmd = "np";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    /**
     * The main function of the command
     * @param msg
     */
    run(msg) {
        this.v.once(`${msg.id}error`, (err) => {
            msg.channel.createMessage(this.t(err));
            this.v.removeListener('queue');
        });
        this.v.once(`${msg.id}_queue`, (queue) => {
            msg.channel.createMessage(this.buildReply(queue, msg));
            this.v.removeListener('error');
        });
        this.v.getQueue(msg);
    }

    /**
     * Builds the reply
     * @param Queue - the queue object
     * @param msg - the message that triggered the command
     * @returns {String} The Reply
     */
    buildReply(Queue, msg) {
        let reply = "";
        let repeat = Queue.repeat !== 'off' ? this.t(`np.repeat-${Queue.repeat}`, {lngs: msg.lang}) : "";
        if (Queue.songs[0].duration && Queue.songs[0].duration !== '') {
            reply = reply + `${this.t('np.song-duration', {
                    lngs: msg.lang,
                    title: Queue.songs[0].title,
                    repeat: repeat,
                    duration: Queue.songs[0].duration,
                    current: Queue.time,
                    interpolation: {escape: false}
                })} \n`;
        } else {
            reply = reply + `${this.t('np.song', {
                    lngs: msg.lang,
                    title: Queue.songs[0].title,
                    repeat: repeat,
                    interpolation: {escape: false}
                })}\n`;
        }
        return reply;
    }
}
module.exports = NowPlaying;