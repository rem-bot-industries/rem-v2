/**
 * Created by julia on 15.11.2016.
 */
let Command = require('../Objects/command');
let path = require("path");
class uwu extends Command {
    constructor(t) {
        super();
        this.cmd = "nyan";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        msg.channel.sendFile(path.join(__dirname, "../res/nyan.jpg"));
    }
}
module.exports = uwu;