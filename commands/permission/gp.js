/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
let PermManager = require('../../modules/permissionManager');
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
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = minimist(messageSplit);
        if (args.r) {
            this.getPerms(msg, 'role');
        } else if (args.c) {
            this.getPerms(msg, 'channel');
        } else if (args.u) {
            this.getPerms(msg, 'user');
        } else {
            this.getPerms(msg, 'guild');
        }
    }

    getPerms(msg, type) {
        this.p.getPermDB(msg, (err, Perms) => {
            if (err) return msg.channel.createMessage(this.t('gp.no-perms', {lngs: msg.lang}));
            let table = new AsciiTable();
            table.setHeading(this.t('gp.table.id', {lngs: msg.lang}),
                this.t('gp.table.id',
                    {lngs: msg.lang}),
                this.t('gp.table.name',
                    {lngs: msg.lang}),
                this.t('gp.table.type',
                    {lngs: msg.lang}),
                this.t('gp.table.cat', {lngs: msg.lang}),
                this.t('gp.table.perm', {lngs: msg.lang}),
                this.t('gp.table.use', {lngs: msg.lang}));
            let added = 0;
            for (let i = 0; i < Perms.length; i++) {
                if (Perms[i].type === type) {
                    if (Perms[i].type === 'channel') {
                        let channel = rem.getChannel(Perms[i].id);
                        table.addRow(added + 1, Perms[i].id, channel.name, Perms[i].type, Perms[i].cat, Perms[i].perm, Perms[i].use);
                        added += 1;
                    } else if (Perms[i].type === 'user') {
                        let user = rem.users.find(u => u.id === Perms[i].id);
                        table.addRow(added + 1, Perms[i].id, user.username + '#' + user.discriminator, Perms[i].type, Perms[i].cat, Perms[i].perm, Perms[i].use);
                        added += 1;
                    } else {
                        table.addRow(added + 1, Perms[i].id, '-', Perms[i].type, Perms[i].cat, Perms[i].perm, Perms[i].use);
                        added += 1;
                    }
                }
            }
            if (added > 0) {
                msg.channel.createMessage('```' + table.toString() + '```');
            } else {
                msg.channel.createMessage(this.t('gp.no-cat', {lngs: msg.lang, cat: type}))
            }
        });
    }
}
module.exports = GetPermission;