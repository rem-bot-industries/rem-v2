/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let clientId = require('../../../main.json').client_id;
class Invite extends Command {
    constructor({t}) {
        super();
        this.cmd = 'invite';
        this.cat = 'generic';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.aliases = ['add'];
        this.help = {
            short: 'help.add.short'
        }
    }

    run(msg) {
        const inviteLink = 'https://discordapp.com/oauth2/authorize?client_id=' + clientId + '&scope=bot&permissions=0';
        msg.channel.createMessage(this.t('add', {lngs: msg.lang, link: inviteLink}))
    }
}
module.exports = Invite;
