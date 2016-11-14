/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
class SetLanguage extends Command {
    constructor(t) {
        super();
        this.cmd = "setLang";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {

    }
}
module.exports = SetLanguage;