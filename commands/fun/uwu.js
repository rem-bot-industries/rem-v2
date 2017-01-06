/**
 * Created by julia on 15.11.2016.
 */
let Command = require('../../structures/command');
class uwu extends Command {
    constructor({t}) {
        super();
        this.cmd = "uwu";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        msg.channel.createMessage("uwu");
    }
}
module.exports = uwu;