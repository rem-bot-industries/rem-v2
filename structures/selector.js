/**
 * Created by julian on 19.11.2016.
 */
// let MessageCollector = require('discord.js').MessageCollector;
let AsciiTable = require('ascii-table');
let winston = require('winston');
class Selector {
    constructor(msg, collection, t, cb) {
        this.msg = msg;
        this.coll = collection;
        this.t = t;
        this.number = 0;
        this.init(cb);
    }

    init(cb) {
        let table = new AsciiTable();
        let i = 1;
        this.coll.forEach(c => {
            if (c.name) {
                table.addRow(i, c.name);
            } else if (c.title) {
                table.addRow(i, c.title);
            } else if (typeof (c.user) !== 'undefined' && c.user.username) {
                table.addRow(i, c.user.username);
            } else if (typeof (c.snippet) !== 'undefined') {
                table.addRow(i, c.snippet.title);
            }

            i += 1;
        });
        table.addRow('c', this.t('generic.cancel', {lngs: this.msg.lang}));
        this.msg.channel.createMessage('```' + table.toString() + '```').then(tableMsg => {
            let collector = this.msg.CON.addCollector(this.msg.channel.id);
            collector.on('message', (msg) => {
                if (this.filterMessage(msg)) {
                    collector.stop();
                    tableMsg.delete().then().catch(err => winston.error(err));
                    msg.delete().then().catch(err => winston.error(err));
                    if (msg.content === 'c') {
                        return cb('generic.abort');
                    } else {
                        return cb(null, this.number);
                    }
                }
            });
        }).catch(err => winston.error(err));
    }

    filterMessage(msg) {
        if (msg.author.id === this.msg.author.id) {
            if (msg.content === 'c') {
                return true;
            }
            let number = 0;
            try {
                number = parseInt(msg.content);
            } catch (e) {
                return false;
            }
            if (isNaN(number)) {
                return false;
            }
            if (number > 0 && number <= this.coll.length) {
                this.number = number;
                return true;
            }
        }
    }
}
module.exports = Selector;