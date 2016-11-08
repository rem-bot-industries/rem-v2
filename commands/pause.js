/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
var SongImporter = require('../modules/songImporter');
/**
 * The pause command,
 * pauses the current song
 * @extends Command
 *
 */
class Pause extends Command {
    /**
     * Create the pause command
     * @param {Function} t - the translation module
     */
    constructor(t) {
        super();
        this.cmd = "pause";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        voiceManager.pause(msg);
        voiceManager.on('error', (err) => {

        })
    }
}
module.exports = Pause;