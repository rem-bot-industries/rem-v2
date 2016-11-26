/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
class Ping extends Command {
    constructor(t) {
        super();
        this.cmd = "ping";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

   run(msg) {
        // this.emit('run');
       let start = Date.now();
       msg.channel.createMessage("pong").then(sendedMsg => {
           let diff = (start - sendedMsg.timestamp );
            sendedMsg.edit(`pong \`${diff}ms\``);
            // this.emit('done');
        }).catch(e => this.emit('error', {msg:msg, cmd:this.cmd, e:e}));
    }
}
module.exports = Ping;