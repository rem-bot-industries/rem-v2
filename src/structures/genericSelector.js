/**
 * Created by Julian/Wolken on 19.11.2016.
 */
let utils = require('./utilities');
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
        let i = 0;
        this.coll.map(c => {
            i += 1;
            return `[${i}] ${c}`;

        });
        this.coll.addRow('c', this.t('generic.cancel', {lngs: this.msg.lang}));
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