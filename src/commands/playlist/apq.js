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
    constructor ({t, v, mod}) {
        super();
        this.cmd = 'apq';
        this.cat = 'playlist';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.r = mod.getMod('raven');
        this.accessLevel = 0;
    }

    async run (msg) {
        msg.content = msg.content.split(' ').splice(1).join(' ');
        msg.content = msg.content.trim();
        if (msg.content === '') {
            return msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));
        }
        try {
            let result = await this.v.addPlaylistToQueue(msg);
            await msg.channel.createMessage(`Added Playlist \`${result.title}\` from the channel \`${result.author}\` with \`${result.songs.length}\` songs to the queue!`);
        } catch (err) {
            console.error(err);
            if (err instanceof TranslatableError) {
                console.error(err);
                msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
            } else {
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
                console.error(err);
                msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
        }
    }
}
module.exports = AddPlaylistToQueue;