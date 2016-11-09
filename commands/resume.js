/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
var SongImporter = require('../modules/songImporter');
/**
 * The resume command,
 * resumes the current song
 * @extends Command
 *
 */
class Resume extends Command {
    /**
     * Create the resume command
     * @param {Function} t - the translation module
     */
    constructor(t) {
        super();
        this.cmd = "resume";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        voiceManager.resume(msg);
        voiceManager.on('error', (err) => {
            msg.channel.sendMessage(err);
        });
        voiceManager.on('success', () => {
            msg.channel.sendMessage(':ok_hand: ');
        });
    }
}
module.exports = Resume;