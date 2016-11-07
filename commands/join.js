/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
class Join extends Command {
    constructor(t) {
        super();
        this.cmd = "voice";
        this.cat = "generic";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

   run(msg) {
       voiceManager.join(msg);
    }
}
module.exports = Join;