/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The QueueMove command, moves songs to different positions
 * @extends Command
 *
 */
class QueueMove extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'qm';
        this.aliases = ['queueMove'];
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.help = {
            short: 'help.qm.short',
            usage: 'help.qm.usage',
            example: 'help.qm.example'
        }
    }

    async run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (msgSplit.length === 0 || msgSplit.length === 1) {
            return msg.channel.createMessage(this.t('qm.missing-args', {lang: msg.lang, prefix: msg.prefix}));
        }
        let target = {start: 0, end: 0};
        for (let i = 0; i < 2; i++) {
            try {
                let targetNumber = parseInt(msgSplit[i]);
                if (isNaN(targetNumber)) {
                    return msg.channel.createMessage(this.t('generic.nan', {lngs: msg.lang}));
                }
                if (i === 0) {
                    target.start = targetNumber;
                } else {
                    target.end = targetNumber;
                }
            } catch (e) {
                return msg.channel.createMessage(this.t('generic.nan', {lngs: msg.lang}));
            }
        }
        try {
            let player = this.v.getPlayer(msg.channel.guild.id);
            let queue = await this.v.getQueue(msg.channel.guild.id);
            if (queue.songs.length === 0) {
                return msg.channel.createMessage(this.t('generic.no-song-in-queue', {lngs: msg.lang}))
            }
            if (queue.songs.length === 1 || target.start <= 1) {
                return msg.channel.createMessage(this.t('generic.modify-playing-song', {lngs: msg.lang}));
            }
            if (target.start > queue.songs.length || target.start < 1) {
                return msg.channel.createMessage(this.t('generic.song-no-exist', {
                    lngs: msg.lang,
                    position: target.start
                }))
            }
            if (target.end > queue.songs.length) {
                target.end = queue.songs.length
            }
            if (target.end < queue.songs.length) {
                target.end = 2
            }
            if (player === undefined) {
                return msg.channel.createMessage(this.t('generic.no-voice', {lngs: msg.lang}));
            }
            let song = queue.songs.splice(target.start - 1, 1);
            song = song[0];
            queue.songs.splice(target.end - 1, 0, song);
            player.setQueueSongs(queue.songs);
            return msg.channel.createMessage(this.t('qm.success', {
                lngs: msg.lang,
                song: song.title,
                start: target.start,
                end: target.end
            }))
        } catch (e) {
            if (e.t) {
                return msg.channel.createMessage(this.t(e.t, {lngs: msg.lang}));
            }
            console.error(e);
            return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = QueueMove;