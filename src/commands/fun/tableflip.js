/**
 * Created by EpicPick on 14.11.2016.
 */
let Command = require('../../structures/command');
class TableFlip extends Command {
    constructor({t}) {
        super();
        this.cmd = 'flip';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.aliases = ['tableflip'];
    }

    run(msg) {
        // this.emit('run');
        let content = msg.content.split(' ').splice(1).join(' ').trim();
        msg.channel.createMessage('\u200B' + content + (content !== '' ? ' ' : '') + '(╯°□°）╯︵ ┻━┻');
    }
}
module.exports = TableFlip;