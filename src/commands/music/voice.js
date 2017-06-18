/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
/**
 * The join voice command
 * @extends Command
 *
 */
class Voice extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = 'voice';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.aliases = ['join']
    }

    async run(msg) {
        try {
            let player = await this.v.join(msg);
            let conn = player.connection;
            let node = player.connection.region ? `${player.connection.region}:${player.connection.nodeID}` : '';
            if (node !== '') {
                return msg.channel.createMessage(this.t('joinVoice.join_region', {
                    lngs: msg.lang,
                    node
                }));
            }
            msg.channel.createMessage(this.t('joinVoice.join', {lngs: msg.lang}));
        } catch (err) {
            console.error(err);
            msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Voice;