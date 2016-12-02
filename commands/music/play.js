/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
let winston = require('winston');
/**
 * The play command
 * plays a song duh.
 * @extends Command
 *
 */
class Play extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t, v) {
        super();
        this.cmd = "play";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            this.v.removeAllListeners();
            winston.error(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once('added', (Song) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t('play.playing', {lngs: msg.lang, song: Song.title}));
        });
        this.v.play(msg);
    }
}
module.exports = Play;