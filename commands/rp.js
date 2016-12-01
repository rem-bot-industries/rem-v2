/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
let PermManager = require('../modules/permissionManager');
let minimist = require('minimist');
let AsciiTable = require('ascii-table');
let async = require('async');
class GetPermission extends Command {
    constructor(t) {
        super();
        this.cmd = "rp";
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
            if (err) return msg.channel.createMessage('No perms set yet.');
            let table = new AsciiTable();
            table.setHeading('ID', 'ID', 'Name', 'type', 'Category', 'Perm', 'Use');
            let added = 0;
            async.eachSeries(Perms, (Perm, cb) => {
                if (Perm.type === type) {
                    if (type === 'channel') {
                        let channel = rem.getChannel(Perm.id);
                        table.addRow(added + 1, Perm.id, channel.name, Perm.type, Perm.cat, Perm.perm, Perm.use);
                    } else {
                        table.addRow(added + 1, Perm.id, '-', Perm.type, Perm.cat, Perm.perm, Perm.use);
                    }
                    added += 1;
                }
                async.setImmediate(() => {
                    cb();
                });
            }, (err) => {
                if (added > 0) {
                    msg.channel.createMessage('```' + table.toString() + '```');
                    this.startCollector(msg);
                } else {
                    msg.channel.createMessage(this.t('gp.no-cat', {lngs: msg.lang, cat: type}))
                }
            });
        });
    }

    startCollector(msg) {
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
                collMsg.channel.createMessage(this.t('generic.cancel', {lngs: msg.lang}));
                collector.stop();
            }

        });
    }
}
module.exports = GetPermission;