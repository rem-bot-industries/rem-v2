/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Say extends Command {
    constructor({t}) {
        super();
        this.cmd = "say";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let content = msg.content.substr(msg.prefix.length + this.cmd.length).trim();
        msg.channel.createMessage('\u200B' + content);
    }
}
module.exports = Say;