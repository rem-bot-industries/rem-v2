/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let util = require('util');
const winston = require('winston');
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
        this.aliases = ['q']
    }

    /**
     * The main function of the command
     * @param msg
     */
    async run(msg) {
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
     */
    buildReply(Queue, msg) {
        let reply;
        winston.debug(Queue);
        let repeat = Queue.repeat !== 'off' ? this.t(`np.repeat-${Queue.repeat}`, {lngs: msg.lang}) : '';
        if (!Queue.songs[0] || Queue.songs.length === 0) {
            return msg.channel.createMessage(this.t('generic.no-song-in-queue', {lngs: msg.lang}));
        }
        if (Queue.songs[0].duration && Queue.songs[0].duration !== '') {
            reply = `${this.t('np.song-duration', {
                lngs: msg.lang,
                title: Queue.songs[0].title,
                repeat: repeat,
                duration: Queue.songs[0].duration,
                current: Queue.time,
                interpolation: {escape: false},
                user: Queue.songs[0].queuedBy ? Queue.songs[0].queuedBy : '-'
            })} \n`;
        } else {
            reply = `${this.t('np.song', {
                lngs: msg.lang,
                title: Queue.songs[0].title,
                repeat: repeat,
                interpolation: {escape: false},
                user: Queue.songs[0].queuedBy ? Queue.songs[0].queuedBy : '-'
            })}\n`;
        }
        if (Queue.songs.length > 1) {
            reply += `${this.t('queue.queued', {lngs: msg.lang})}\n\`\`\``;
        }
        for (let q = 1; q < Queue.songs.length; q++) {
            if (!Queue.songs[q]) continue;
            if ((reply.length + Queue.songs[q].title.length) > 1800) { // Discord 2000 char limit
                reply += `... +${Queue.songs.length - q}`;
                break;
            }
            reply += `${q + 1}. ${Queue.songs[q].title}`;
            if (Queue.songs[q].duration) {
                reply += ` ${Queue.songs[q].duration}`;
            }
            if (Queue.songs[q].queuedBy) {
                reply += ' ';
                reply += this.t('queue.by', {
                    lngs: msg.lang,
                    user: Queue.songs[q].queuedBy ? Queue.songs[q].queuedBy : '-'
                });
            }
            reply += '\n';
        }
        if (Queue.songs.length > 1) reply += '```';
        return reply;
    }
}

module.exports = Queue;
