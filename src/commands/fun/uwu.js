/**
 * Created by Julian/Wolke on 15.11.2016.
 */
let Command = require('../../structures/command');
class uwu extends Command {
    constructor({t}) {
        super();
        this.cmd = 'uwu';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // this.emit('run');
        let content = msg.content.split(' ').splice(1).join(' ').trim();
        msg.channel.createMessage('\u200B' + content + (content !== '' ? ' ' : '') + 'uwu');
    }
}
module.exports = uwu;