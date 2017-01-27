/**
 * Created by Julian/Wolke on 18.01.2017.
 */
let Command = require('../../structures/command');
class ResetPermissions extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'resetPerms';
        this.cat = 'permission';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
    }

    run(msg) {
        msg.channel.createMessage(this.t('reset-perms.confirmation', {lngs: msg.lang}));
        let collector = msg.CON.addCollector(msg.channel.id, {
            filter: (conMsg) => {
                return (msg.author.id === conMsg.author.id);
            }
        });
        collector.on('message', (msg) => {
            collector.stop();
            switch (msg.content) {
                case 'yes': {
                    this.p.resetDbPerm(msg.channel.guild.id, (err) => {
                        if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                        msg.channel.createMessage(this.t('reset-perms.success', {lngs: msg.lang}));
                    });
                    return;
                }
                case 'no': {
                    msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang})).then().catch(err => console.error(err));
                    return;
                }
                default: {
                    msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                    return;
                }
            }
        });

    }
}
module.exports = ResetPermissions;