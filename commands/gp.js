/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
var PermManager = require('../modules/permissionManager');
var minimist = require('minimist');
var AsciiTable = require('ascii-table');
class GetPermission extends Command {
    constructor(t) {
        super();
        this.cmd = "gp";
        this.cat = "permission";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = new PermManager();
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
            if (err) return msg.channel.sendMessage('No perms set yet.');
            let table = new AsciiTable();
            table.setHeading('ID', 'ID', 'type', 'Category', 'Perm', 'Use');
            for (var i = 0; i < Perms.length; i++) {
                table.addRow(i + 1, Perms[i].id, Perms[i].type, Perms[i].cat, Perms[i].perm, Perms[i].use)
            }
            msg.channel.sendCode('', table.toString());
        });
    }
}
module.exports = GetPermission;