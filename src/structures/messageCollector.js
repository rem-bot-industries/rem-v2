/**
 * Created by Aurieh#0258 on 26.11.2016.
 * Modified by Wolke
 */
Array.prototype.removeItem = function (item) {
    return this.splice(this.indexOf(item), 1);
};
let EventEmitter = require('eventemitter3');
class MessageCollector extends EventEmitter {
    constructor(channelID, opts) {
        super();
        this.max = 1000;
        this.filter = (msg) => {
            return true;
        };
        this.channelID = channelID;
        this.stopped = false;
        this.collected = new Map();
        this._stopTimeout = null;
        if (opts) {
            if (opts.hasOwnProperty('timeout')) {
                this._stopTimeout = setTimeout(() => {
                    this.stop();
                }, opts.timeout);
            }
            if (opts.hasOwnProperty('max')) {
                this.max = opts.max;
            }
            if (opts.hasOwnProperty('filter')) {
                this.filter = opts.filter;
            }
        }
        this.on('message', this.message);
    }

    message(msg) {
        this.max--;
        this.collected.set(msg.id, msg);
        if (this.max === 0) {
            this.stop();
        }
    }

    stop() {
        if (this._stopTimeout) {
            clearTimeout(this._stopTimeout);
        }
        this.stopped = true;
        this.emit('end');
        this.removeAllListeners();
        // this.removeAllListeners();
    }

    end() {
        this.stop();
    }

    check(msg) {
        if (!this.stopped && this.filter(msg) && msg.author.id !== rem.user.id) {
            this.emit('message', msg);
        }
    }
}

module.exports = MessageCollector;