/**
 * Created by Julian on 25.05.2017.
 */
const Command = require('../../structures/command');
class OptionsCommand extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'opts';
        this.aliases = ['options', 'settings'];
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.sm = mod.getMod('sm');
        this.hidden = true;
        this.help = {
            short: 'help.opts.short',
            usage: 'help.opts.usage',
            example: 'help.opts.example'
        }
    }

    run(msg) {

    }
}
module.exports = OptionsCommand;