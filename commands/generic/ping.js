/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Ping extends Command {
    constructor({t}) {
        super();
        this.cmd = "ping";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        let start = msg.timestamp;
        msg.channel.createMessage("pong").then(sendedMsg => {
            let diff = (sendedMsg.timestamp - start);
            sendedMsg.edit(`pong \`${diff}ms\``);
            // this.emit('done');
        }).catch(e => this.emit('error', {msg: msg, cmd: this.cmd, e: e}));
    }
}
module.exports = Ping;