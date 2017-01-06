/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
class Add extends Command {
    constructor({t}) {
        super();
        this.cmd = "add";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        if (msg.channel.type !== 1) {
            msg.author.getDMChannel().then(channel => {
                channel.createMessage(`https://ram.moe/invite`);
            }).catch(e => winston.error);
            msg.channel.createMessage(`:ok_hand: `);
        } else {
            msg.channel.createMessage(`https://ram.moe/invite`);
        }
    }
}
module.exports = Add;