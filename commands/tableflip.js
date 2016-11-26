/**
 * Created by EpicPick on 14.11.2016.
 */
var Command = require('../Objects/command');
class TableFlip extends Command {
    constructor(t) {
        super();
        this.cmd = "flip";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        msg.channel.createMessage("(╯°□°）╯︵ ┻━┻");
    }
}
module.exports = TableFlip;