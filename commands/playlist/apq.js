/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
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
        this.v.once(`${msg.id}_error`, (err) => {
            this.clearListeners();
            console.error(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_pl_added`, (Playlist) => {
            this.clearListeners();
            msg.channel.createMessage(`Added Playlist \`${Playlist.title}\` from the channel \`${Playlist.author}\` with \`${Playlist.songs.length}\` songs to the queue!`);
        });
        this.v.addPlaylistToQueue(msg, false);
    }

    clearListeners() {
        this.v.removeAllListeners();
    }
}
module.exports = AddPlaylistToQueue;