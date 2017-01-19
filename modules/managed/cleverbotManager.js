/**
 * Created by Julian/Wolke on 27.11.2016.
 */
let Manager = require('../../structures/manager');
let clever = require("cleverbot-node");
let re = /<@[0-9].*>/g;
let cleverbotKey = require('../../config/main.json').cleverbot_api_key;
class CleverBotManager extends Manager {
    constructor() {
        super();
        this.cleverbots = {};
        this.ready = false;
    }

    init() {
        let that = this;
        return new Promise(function (resolve, reject) {
            clever.prepare(() => {
                that.ready = true;
                resolve();
            });
        });
    }

    talk(msg) {
        if (this.ready) {
            if (this.cleverbots[msg.channel.guild.id]) {
                this.cleverbots[msg.channel.guild.id].talk(msg, (reply) => {
                    msg.channel.createMessage(':pencil: ' + reply);
                });
            } else {
                this.cleverbots[msg.channel.guild.id] = new CleverBot();
                this.cleverbots[msg.channel.guild.id].talk(msg, (reply) => {
                    msg.channel.createMessage(':pencil: ' + reply);
                });
            }
        }
    }
}
class CleverBot {
    constructor() {
        this.clever = new clever();
        this.clever.configure({botapi: cleverbotKey});
    }

    talk(msg, cb) {
        let msgClean = msg.content.replace(re, "");
        this.clever.write(msgClean, (res) => {
            cb(res.message);
        });
    }
}
module.exports = {class: CleverBotManager, deps: [], async: true, shortcode: 'cm'};