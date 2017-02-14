/**
 * Created by Julian/Wolke on 27.11.2016.
 */
let Manager = require('../../structures/manager');
let Clever = require('cleverbot.io');
let re = /<@[0-9].*>/g;
let cleverbotKey = remConfig.cleverbot_api_key;
let cleverbotUser = remConfig.cleverbot_api_user;
class CleverBotManager extends Manager {
    constructor() {
        super();
        this.cleverbots = {};
        this.bot = new Clever(cleverbotUser, cleverbotKey);
    }


    talk(msg) {
        if (this.cleverbots[msg.channel.guild.id]) {
            this.cleverbots[msg.channel.guild.id].talk(msg, (err, reply) => {
                if (err) return msg.channel.createMessage(':x: An error with cleverbot occured!');
                msg.channel.createMessage(':pencil: ' + reply);
            });
        } else {
            this.cleverbots[msg.channel.guild.id] = new CleverBot(this.bot);
            this.cleverbots[msg.channel.guild.id].createSession(msg.channel.guild.id, (err) => {
                if (err) return msg.channel.createMessage(':x: An error with cleverbot occured!');
                this.cleverbots[msg.channel.guild.id].talk(msg, (err, reply) => {
                    if (err) return msg.channel.createMessage(':x: An error with cleverbot occured!');
                    msg.channel.createMessage(':pencil: ' + reply);
                });
            });

        }
    }
}
class CleverBot {
    constructor(bot) {
        this.clever = bot;
    }

    talk(msg, cb) {
        let msgClean = msg.content.replace(re, '');
        this.clever.setNick(`wolke_rem_discordbot_${msg.channel.guild.id}`);
        this.clever.ask(msgClean, (err, res) => {
            if (err) return cb(err);
            cb(null, res);
        });
    }

    createSession(name, cb) {
        this.clever.setNick(`wolke_rem_discordbot_${name}`);
        this.clever.create((err, session) => {
            if (err) return cb(err);
            cb();
        });
    }
}
module.exports = {class: CleverBotManager, deps: [], async: false, shortcode: 'cm'};