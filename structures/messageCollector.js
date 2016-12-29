/**
 * Created by Aurieh#0258 on 26.11.2016.
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
            return true
        };
        this.channelID = channelID;
        this.stopped = false;
        this.collected = new Map();
        this._stopTimeout = null;
        if (opts) {
            if (opts.hasOwnProperty('timeout')) {
                this._stopTimeout = setTimeout(() => {
                    this.emit("end");
                }, opts.timeout);
            }
            if (opts.hasOwnProperty('max')) {
                this.max = opts.max;
            }
            if (opts.hasOwnProperty('filter')) {
                this.filter = opts.filter;
            }
        }
        this.on("message", this.message);
        this.on("end", this.end);
    }

    message(msg) {
        this.collected.set(msg.id, msg);
    }

    stop() {
        if (this._stopTimeout) {
            clearTimeout(this._stopTimeout);
        }
        this.stopped = true;
        this.emit('end');
        // this.removeAllListeners();
    }

    // awaitMessage(filter, ammount, timeout) {
    //     return new Promise((resolve, reject) => {
    //         let collected = new Map();
    //         const onMessage = message => {
    //             collected.set(message.id, message);
    //             if (collected.size > ammount) {
    //                 this.off("message", onMessage);
    //                 resolve(collected);
    //                 return;
    //             }
    //         };
    //
    //         const onEnd = () => {
    //             this.off("end", onEnd);
    //             reject(new Error("Collector timed out"));
    //         };

    // this.on("message", onMessage);
    // this.on("end", onEnd);
    // setTimeout(() => reject(new Error("Timed out")), timeout);
    //     });
    // }

    check(msg) {
        if (msg.channel.id === this.channelID && !this.stopped && this.filter(msg) && msg.author.id !== rem.user.id) {
            this.emit("message", msg);
        }
    }
}

module.exports = MessageCollector;