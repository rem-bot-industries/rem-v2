/**
 * Created by haukehannig on 19.11.2016.
 */
// let MessageCollector = require('discord.js').MessageCollector;
let AsciiTable = require('ascii-table');
class Selector {
    constructor(msg, collection, cb) {
        this.msg = msg;
        this.coll = collection;
        this.init(cb);
        this.collector = null;
        this.number = 0;
    }

    init(cb) {
        let table = new AsciiTable();
        let i = 1;
        this.coll.map(c => {
            if (c.name) {
                table.addRow(i, c.name);
            } else if (c.user.username) {
                table.addRow(i, c.user.username);
            }

            i += 1;
        });
        table.addRow('c', 'cancel');
        this.msg.channel.sendCode('', table.toString());
        this.collector = new MessageCollector(this.msg.channel, (msg, collector) => {
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
        }, {maxMatches: 1});
        this.collector.on('message', (msg) => {
            if (msg.content === 'c') {
                return cb('canceled');
            }
            cb(null, this.number);
        });
    }
}
module.exports = Selector;