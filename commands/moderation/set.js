/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class SetLanguage extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "set";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
        this.s = mod.getMod('sm');

    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined') {

        } else {

        }
    }
}
module.exports = SetLanguage;