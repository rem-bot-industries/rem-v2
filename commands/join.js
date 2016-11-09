/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
/**
 * The join command
 * @extends Command
 *
 */
class Join extends Command {
    constructor(t) {
        super();
        this.cmd = "voice";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        voiceManager.join(msg, (err) => {
            if (err) return msg.reply(this.t(err));
        });


    }
}
module.exports = Join;