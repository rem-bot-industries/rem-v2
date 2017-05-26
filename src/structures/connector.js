/**
 * Created by Aurieh#0258 on 26.11.2016.
 * Extended/Modified by Wolke#6746
 */
const MessageCollector = require('./messageCollector');

class Connector {
    constructor() {
        this.collectors = {};
    }

    addCollector(channelID, opts) {
        let id = `${channelID}_${Date.now()}`;
        let collector = new MessageCollector(channelID, opts);
        collector.once('stop', () => {
            delete this.collectors[id];
        });
        this.collectors[id] = collector;
        return collector;
    }

    invokeAllCollectors(message) { // you basically run this function on every `messageCreate`
        for (let key in this.collectors) {
            if (this.collectors.hasOwnProperty(key)) {
                if (key.startsWith(message.channel.id)) {
                    this.collectors[key].check(message);
                }
            }
        }
    }
}

module.exports = Connector;