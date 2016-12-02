/**
 * Created by julia on 24.11.2016.
 */
let Command = require('../../Objects/command');
class GetChannelPermission extends Command {
    constructor(t) {
        super();
        this.cmd = "gcp";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        let overwrites = msg.channel.permissionOverwrites;
        let allowed = [];
        let final = [];
        let roles = [];
        overwrites.map((o) => {
            if (o.has('readMessages')) allowed.push(o);
        });
        for (let i = 0; i < allowed.length; i++) {
            if (allowed[i].type === 'user') {
                final.push(rem.users.find((u) => u.id === allowed[i].id));
            } else if (allowed[i].type === 'role') {
                roles.push(msg.guild.roles.find((r) => r.id === allowed[i].id));
            }
        }
        if (roles.length > 0) {
            for (let i = 0; i < roles.length; i++) {
                msg.guild.members.map(m => {
                    for (let x = 0; x < m.roles.length; x++) {
                        if (m.roles[x] === roles[i].id) {
                            final.push(m);
                        }
                    }
                });
            }
        }
        msg.channel.createMessage(final.length - 1 + ' people can view this channel.');
    }
}
module.exports = GetChannelPermission;