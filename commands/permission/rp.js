/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let minimist = require('minimist');
let AsciiTable = require('ascii-table');
let async = require('async');
class GetPermission extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "rp";
        this.cat = "permission";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
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
            let added = [];
            async.eachSeries(Perms, (Perm, cb) => {
                if (Perm.type === type) {
                    if (type === 'channel') {
                        let channel = rem.getChannel(Perm.id);
                        table.addRow(added.length + 1, Perm.id, channel ? channel.name : 'deleted', Perm.type, Perm.cat, Perm.perm, Perm.use);
                    } else {
                        table.addRow(added.length + 1, Perm.id, '-', Perm.type, Perm.cat, Perm.perm, Perm.use);
                    }
                    added.push(Perm);
                }
                async.setImmediate(() => {
                    cb();
                });
            }, (err) => {
                if (added.length > 0) {
                    table.addRow('c', this.t('generic.cancel'));
                    msg.channel.createMessage('```' + table.toString() + '```');
                    this.startCollector(msg, added);
                } else {
                    msg.channel.createMessage(this.t('gp.no-cat', {lngs: msg.lang, cat: type}))
                }
            });
        });
    }

    startCollector(msg, added) {
        let collector = msg.CON.addCollector(msg.channel.id, {
            filter: (newMSG) => {
                return msg.author.id === newMSG.author.id
            }
        });
        collector.on('message', (collMsg) => {
            let number = 0;
            try {
                number = parseInt(collMsg.content);
            } catch (e) {

            }
            if (msg.content.startsWith(msg.prefix)) {
                collector.stop();
            }
            if (collMsg.content === 'c') {
                collMsg.channel.createMessage(this.t('generic.abort', {lngs: msg.lang}));
                collector.stop();
            }
            if (number > 0 && number - 1 < added.length) {
                let perm = added[number - 1];
                this.p.removePermission(msg.guild.id, perm, (err) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    msg.channel.createMessage(this.t('rp.success', {
                        lngs: msg.lang,
                        node: perm.cat + '.' + perm.perm,
                        type: perm.type,
                        id: perm.id
                    }))
                });
            }
        });
    }
}
module.exports = GetPermission;