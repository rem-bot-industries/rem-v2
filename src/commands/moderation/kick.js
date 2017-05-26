/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
class Kick extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'kick';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.kick.short',
            usage: 'help.kick.usage',
            example: 'help.kick.example'
        }
    }
}
module.exports = Kick;