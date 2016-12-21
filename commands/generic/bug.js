/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
class Bug extends Command {
    constructor(t) {
        super();
        this.cmd = "bug";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        msg.author.getDMChannel().then(channel => {
            channel.createMessage(`https://discord.gg/yuTxmYn`);
        }).catch(e => console.error);
        msg.channel.createMessage(`:ok_hand: `);
    }
}
module.exports = Bug;