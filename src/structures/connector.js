/**
 * Created by Aurieh#0258 on 26.11.2016.
 */
const MessageCollector = require("./messageCollector");

class Connector {
    constructor() {
        this.collectors = [];
    }

    addCollector(channelID, opts, filter) {
        let collector = new MessageCollector(channelID, opts, filter);
        this.collectors.push(collector);
        return collector;
    }

    invokeAllCollectors(message) { // you basically run this function on every `messageCreate`
        for (let collector of this.collectors) {
            collector.check(message);
        }
    }
}

module.exports = Connector;