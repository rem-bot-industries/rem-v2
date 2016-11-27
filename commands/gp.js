/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
let PermManager = require('../modules/permissionManager');
let minimist = require('minimist');
let AsciiTable = require('ascii-table');
class GetPermission extends Command {
    constructor(t) {
        super();
        this.cmd = "gp";
        this.cat = "permission";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = new PermManager();
        this.hidden = true;
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = minimist(messageSplit);
        if (args.r) {
            this.getPerms(msg, 'role');
        }
        if (args.c) {
            this.getPerms(msg, 'channel');
        }
        if (args.u) {
            this.getPerms(msg, 'user');
        }
        this.getPerms(msg, 'guild');
    }

    getPerms(msg, type) {
        this.p.getPermDB(msg, (err, Perms) => {
            if (err) return msg.channel.createMessage('No perms set yet.');
            let table = new AsciiTable();
            table.setHeading('ID', 'ID', 'type', 'Category', 'Perm', 'Use');
            for (let i = 0; i < Perms.length; i++) {
                table.addRow(i + 1, Perms[i].id, Perms[i].type, Perms[i].cat, Perms[i].perm, Perms[i].use)
            }
            msg.channel.createMessage('```' + table.toString() + '```');
        });
    }
}
module.exports = GetPermission;