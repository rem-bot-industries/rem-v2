/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
class Play extends Command {
    constructor(t) {
        super();
        this.cmd = "play";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

   run(msg) {
       voiceManager.play(msg, (err) => {
            if (err) return this.emit(err);
       });
    }
}
module.exports = Play;