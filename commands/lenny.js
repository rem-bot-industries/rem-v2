/**
 * Created by EpicPick on 13.11.2016.
 */
var Command = require('../Objects/command');
class Lenny extends Command {
    constructor(t) {
        super();
        this.cmd = "lenny";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        msg.channel.sendMessage("( ͡° ͜ʖ ͡°)");
    }
}
module.exports = Lenny;