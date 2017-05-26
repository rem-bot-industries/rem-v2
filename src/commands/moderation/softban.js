/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
class Softban extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'softban';
        this.aliases = ['sb'];
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.softban.short',
            usage: 'help.softban.usage',
            example: 'help.softban.example'
        }
    }
}
module.exports = Softban;