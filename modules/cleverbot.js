/**
 * Created by julia on 27.11.2016.
 */
let clever = require("cleverbot-node");
let re = /<@[0-9].*>/g;
class CleverBotManager {
    constructor() {
        this.cleverbots = {};
        clever.prepare(() => {
            this.setReady()
        });
        this.ready = false;
    }

    talk(msg) {
        if (this.ready) {
            if (this.cleverbots[msg.guild.id]) {
                this.cleverbots[msg.guild.id].talk(msg, (reply) => {
                    msg.channel.createMessage(':pencil: ' + reply);
                });
            } else {
                this.cleverbots[msg.guild.id] = new CleverBot();
                this.cleverbots[msg.guild.id].talk(msg, (reply) => {
                    msg.channel.createMessage(':pencil: ' + reply);
                });
            }
        }
    }

    setReady() {
        this.ready = true;
    }
}
class CleverBot {
    constructor() {
        this.clever = new clever();
    }

    talk(msg, cb) {
        let msgClean = msg.content.replace(re, "");
        this.clever.write(msgClean, (res) => {
            cb(res.message);
        });
    }
}
module.exports = CleverBotManager;