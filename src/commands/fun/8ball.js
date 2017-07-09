/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
class EightBall extends Command {
    constructor({t}) {
        super();
        this.cmd = '8ball';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.8ball.short',
            usage: 'help.8ball.usage',
            example: 'help.8ball.example'
        }
    }

    run(msg) {
        let content = msg.content.substr(msg.prefix.length + this.cmd.length).trim();
        if (content && content !== '') {
            let random = Math.floor(Math.random() * 20);
            msg.channel.createMessage(`${msg.author.mention}, ${this.t(`8ball.answers.${random}`, {lngs: msg.lang})}`);
        } else {
            msg.channel.createMessage(`${msg.author.mention}, ${this.t('8ball.no-message', {lngs: msg.lang})}`);
        }
    }
}
module.exports = EightBall;