/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let track_error = !require('../../config/main.json').no_error_tracking;
/**
 * The addToQueueCommand
 * @extends Command
 *
 */
class AddPlaylistToQueue extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "apq";
        this.cat = "playlist";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.addPlaylistToQueue(msg).then(result => {
            let Playlist = result.data;
            msg.channel.createMessage(`Added Playlist \`${Playlist.title}\` from the channel \`${Playlist.author}\` with \`${Playlist.songs.length}\` songs to the queue!`)
        }).catch(err => {
            if (track_error) {
                this.r.captureException(err, {
                    msgId: msg.id,
                    extra: {
                        userId: msg.author.id,
                        guildId: msg.guild.id,
                        msg: msg.content
                    }
                });
            }
            console.error(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
    }
}
module.exports = AddPlaylistToQueue;