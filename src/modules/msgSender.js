/**
 * Created by Julian/Wolke on 11.12.2016.
 */
let winston = require('winston');
class msgSender {
    constructor(bot) {
        this.b = bot;
    }

    sendChannel(id, content) {
        return new Promise((resolve, reject) => {
            this.b.createMessage(id, content).then(resolve).catch(reject);
        }).catch(winston.error);
    }

    sendDm(user, content) {
        return new Promise((resolve, reject) => {
            user.getDMChannel().then(channel => {
                channel.createMessage(content).then(resolve);
            }).catch(reject);
        });
    }
}