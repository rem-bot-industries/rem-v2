/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Add extends Command {
    constructor(t) {
        super();
        this.cmd = "add";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        msg.author.getDMChannel().then(channel => {
            channel.createMessage(`https://ram.moe/invite`);
        }).catch(e => console.error);
        msg.channel.createMessage(`:ok_hand: `);
    }
}
module.exports = Add;