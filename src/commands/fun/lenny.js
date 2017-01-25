/**
 * Created by EpicPick on 13.11.2016.
 */
let Command = require('../../structures/command');
class Lenny extends Command {
    constructor({t}) {
        super();
        this.cmd = "lenny";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        msg.channel.createMessage('\u200B' + "( ͡° ͜ʖ ͡°)");
    }
}
module.exports = Lenny;