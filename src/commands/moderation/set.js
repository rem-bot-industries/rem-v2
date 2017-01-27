/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
class SetLanguage extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'set';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
        this.s = mod.getMod('sm');
        this.hidden = true;

    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined') {
            switch (msgSplit[1]) {
                case 'guild': {
                    return;
                }
                case 'channel': {
                    return;
                }
                case 'user': {
                    return;
                }
                default: {
                    return;
                }
            }
        } else {

        }
    }

}
module.exports = SetLanguage;