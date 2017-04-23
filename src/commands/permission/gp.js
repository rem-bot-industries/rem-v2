/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let minimist = require('minimist');
let AsciiTable = require('ascii-table');
class GetPermission extends Command {
    constructor ({t, mod}) {
        super();
        this.cmd = 'gp';
        this.cat = 'permission';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
    }

    run (msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = minimist(messageSplit, {boolean: ['r', 'c', 'u']});
        let start = this.parseStart(args);
        if (args.r) {
            this.getPerms(msg, 'role', start);
        } else if (args.c) {
            this.getPerms(msg, 'channel', start);
        } else if (args.u) {
            this.getPerms(msg, 'user', start);
        } else {
            this.getPerms(msg, 'guild', start);
        }
    }

    parseStart (args) {
        if (args._.length > 0) {
            try {
                let start = parseInt(args._[0]);
                if (isNaN(start) || start < 1) {
                    return 0;
                }
                return start - 1;
            } catch (e) {
                return 0;
            }
        } else {
            return 0;
        }
    }

    getPerms (msg, type, start) {
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
            let filteredPerms = Perms.filter((val) => val.type === type);
            if (filteredPerms.length === 0) {
                return msg.channel.createMessage(this.t('gp.no-cat', {lngs: msg.lang, cat: type}));
            }
            if (filteredPerms.length / 8 <= start) {
                return msg.channel.createMessage(this.t('gp.page-does-not-exist', {lngs: msg.lang}));
            }
            for (let i = start * 8; i < filteredPerms.length; i++) {
                if (filteredPerms[i].type === 'channel') {
                    let channel = rem.getChannel(filteredPerms[i].id);
                    let name = channel ? channel.name : 'deleted';
                    name = name.length > 50 ? name.substring(0, 50) + '...' : name;
                    table.addRow(i + 1, filteredPerms[i].id, name, filteredPerms[i].type, filteredPerms[i].cat, filteredPerms[i].perm, filteredPerms[i].use);
                } else if (filteredPerms[i].type === 'user') {
                    let user = rem.users.find(u => u.id === filteredPerms[i].id);
                    table.addRow(i + 1, filteredPerms[i].id, user ? `${user.username}#${user.discriminator}` : 'deleted', filteredPerms[i].type, filteredPerms[i].cat, filteredPerms[i].perm, filteredPerms[i].use);
                } else if (filteredPerms[i].type === 'role') {
                    let role = msg.channel.guild.roles.find(r => r.id === filteredPerms[i].id);
                    table.addRow(i + 1, filteredPerms[i].id, role ? role.name : 'deleted', filteredPerms[i].type, filteredPerms[i].cat, filteredPerms[i].perm, filteredPerms[i].use);
                } else {
                    table.addRow(i + 1, filteredPerms[i].id, 'Guild', filteredPerms[i].type, filteredPerms[i].cat, filteredPerms[i].perm, filteredPerms[i].use);
                }
                if (i === start * 8 + 7) break;
            }
            let tableString = '```' + table.toString() + '```';
            // console.log(tableString.length);
            // console.log(tableString);
            tableString = (filteredPerms.length > 8 ? `${this.t('generic.page', {lngs: msg.lang})}: [${start + 1}/${Math.floor((filteredPerms.length / 8) - 0.01) + 1}]` : '') + tableString;
            msg.channel.createMessage(tableString);
        });
    }
}
module.exports = GetPermission;