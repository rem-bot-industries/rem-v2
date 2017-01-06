/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Git extends Command {
    constructor({t}) {
        super();
        this.cmd = "git";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        msg.channel.createMessage('https://github.com/DasWolke/rem-v2');
    }
}
module.exports = Git;