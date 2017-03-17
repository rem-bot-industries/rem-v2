/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let util = require('util');
/**
 * The show queue command,
 * shows the current queue
 * @extends Command
 *
 */
class Queue extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'queue';
        this.cat = 'music';
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
        this.v.once(`${msg.id}_error`, (err) => {
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
     */
    buildReply(Queue, msg) {
        let reply;
        let repeat = Queue.repeat !== 'off' ? this.t(`np.repeat-${Queue.repeat}`, {lngs: msg.lang}) : '';
        if (Queue.songs[0] && Queue.songs[0].duration && Queue.songs[0].duration !== '') {
            reply = `${this.t('np.song-duration', {
                lngs: msg.lang,
                title: Queue.songs[0].title,
                repeat: repeat,
                duration: Queue.songs[0].duration,
                current: Queue.time,
                interpolation: { escape: false }
            })} \n`;
        }  else {
            reply += `${this.t('np.song', {
                lngs: msg.lang,
                title: Queue.songs[0].title,
                repeat: repeat,
                interpolation: {escape: false}
            })}\n`;
        }
        if (Queue.songs.length > 1) {
            reply += `${this.t('queue.queued', {lngs: msg.lang})}\n\`\`\``;
        }
        for (let q = 1; q < Queue.songs.length; q++) {
            if (!Queue.songs[q]) continue;
            if ((reply.length + Queue.songs[q].title.length) > 1970) { // Discord 2000 char limit
                reply += `... +${Queue.songs.length - q}`;
                break;
            }
            reply += `${q + 1}. ${Queue.songs[q].title}`;
            if (Queue.songs[q].duration) reply += ` ${Queue.songs[q].duration}`;
            reply += '\n';
        }
        if (Queue.songs.length > 1) reply += '```';
        return reply;
    }
}

module.exports = Queue;