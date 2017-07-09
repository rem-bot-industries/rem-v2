/**
 * Created by EpicPick on 13.11.2016.
 */
let Command = require('../../structures/command');
class Lenny extends Command {
    constructor({t}) {
        super();
        this.cmd = 'lenny';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.lenny.short',
            usage: 'help.lenny.usage',
            example: 'help.lenny.example'
        }
    }

    run(msg) {
        // this.emit('run');
        let content = msg.content.split(' ').splice(1).join(' ').trim();
        msg.channel.createMessage('\u200B' + content + (content !== '' ? ' ' : '') + '( ͡° ͜ʖ ͡°)');
    }
}
module.exports = Lenny;