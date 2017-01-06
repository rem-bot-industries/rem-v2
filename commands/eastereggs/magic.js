/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Magic extends Command {
    constructor({t}) {
        super();
        this.cmd = "magic";
        this.cat = "eastereggs";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        msg.channel.createMessage(this.t('eastereggs.magic', {lngs: msg.lang}));
    }
}
module.exports = Magic;