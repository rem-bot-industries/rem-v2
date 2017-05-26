/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
class Ban extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'ban';
        this.aliases = ['b'];
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.ban.short',
            usage: 'help.ban.usage',
            example: 'help.ban.example'
        }
    }
}
module.exports = Ban;