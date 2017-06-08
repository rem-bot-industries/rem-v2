/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
const inviteLink = remConfig.invite_url;
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
        let inviteLink = 'https://ram.moe/invite';
        msg.channel.createMessage(this.t('add', {lngs: msg.lang, link: inviteLink}))
    }
}
module.exports = Invite;