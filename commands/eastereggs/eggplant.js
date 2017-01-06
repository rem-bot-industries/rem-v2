/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Magic extends Command {
    constructor({t}) {
        super();
        this.cmd = "eggplant";
        this.cat = "eastereggs";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        msg.channel.createMessage(':eggplant: ');
    }
}
module.exports = Magic;