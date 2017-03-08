/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let track_error = !remConfig.no_error_tracking;
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
     * @param {Object} mod - the module manager
     */
    constructor({t, v, mod}) {
        super();
        this.cmd = 'apq';
        this.cat = 'playlist';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.r = mod.getMod('raven');
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.addPlaylistToQueue(msg).then(result => {
            let Playlist = result.data;
            msg.channel.createMessage(`Added Playlist \`${Playlist.title}\` from the channel \`${Playlist.author}\` with \`${Playlist.songs.length}\` songs to the queue!`);
        }).catch(err => {
            console.error(err);
            if (typeof(err) === 'object') {
                err = err.err;
            }
            if (err !== 'joinVoice.no-voice' && err !== 'joinVoice.error' && err !== 'generic.error') {
                if (track_error) {
                    this.r.captureException(err, {
                        extra: {
                            userId: msg.author.id,
                            guildId: msg.channel.guild.id,
                            msg: msg.content,
                            msgId: msg.id
                        }
                    });
                }
                // console.error(err);
            } else {
                return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
            }
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
    }
}
module.exports = AddPlaylistToQueue;