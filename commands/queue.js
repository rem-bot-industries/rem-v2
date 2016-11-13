/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
var util = require("util");
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
    constructor(t, v) {
        super();
        this.cmd = "queue";
        this.cat = "voice";
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
        this.v.once('error', (err) => {
            msg.channel.sendMessage(this.t(err));
            this.v.removeListener('queue');
        });
        this.v.once('queue', (queue) => {
            msg.channel.sendMessage(this.buildReply(queue, msg));
            this.v.removeListener('error');
        });
        this.v.getQueue(msg);
    }

    /**
     * Builds the reply
     * @param Queue - the queue pbject
     * @param message - the message that triggered the command
     */
    buildReply(Queue, message) {
        let reply = "";
        let iteration = Queue.songs.length > 20 ? 20 : Queue.songs.length;
        for (var q = 0; q < iteration; q++) {
            if (q === 0) {
                let repeat = Queue.repeat ? this.t('np.repeat-on', {lngs: message.lang}) : "";
                if (Queue.songs[0].duration && Queue.songs[0].duration !== '') {
                    reply = reply + `${this.t('np.song-duration', {
                            lngs: message.lang,
                            title: Queue.songs[0].title,
                            repeat: repeat,
                            duration: Queue.songs[0].duration,
                            current: Queue.time,
                            interpolation: {escape: false}
                        })} \n`;
                } else {
                    reply = reply + `${this.t('np.song', {
                            lngs: message.lang,
                            title: Queue.songs[0].title,
                            repeat: repeat,
                            interpolation: {escape: false}
                        })}\n`;
                }
                if (Queue.songs.length > 1) {
                    reply = `${reply}${this.t('queue.queued', {lngs: message.lang})}\n\`\`\``;
                }
            } else {
                let end = '\n';
                if (q === Queue.songs.length - 1) {
                    end = `\`\`\``;
                }
                if (Queue.songs[q].duration) {
                    reply = reply + `${parseInt(q + 1)}. ${Queue.songs[q].title} ${Queue.songs[q].duration}${end}`;
                } else {
                    reply = reply + `${parseInt(q + 1)}. ${Queue.songs[q].title}${end}`;
                }
            }

        }
        if (Queue.songs.length > 20) {
            reply = reply + `${parseInt(21)}. ${this.t('generic.more', {
                    lngs: message.lang,
                    number: Queue.songs.length - 20
                })}...\`\`\``;
        }
        return reply;
    }
}
module.exports = Queue;