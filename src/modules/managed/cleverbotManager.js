/**
 * Created by Julian/Wolke on 27.11.2016.
 */
let Manager = require('../../structures/manager');
let Clever = require('better-cleverbot-io');
let re = /<@[0-9].*>/g;
let cleverbotKey = remConfig.cleverbot_api_key;
let cleverbotUser = remConfig.cleverbot_api_user;
class CleverBotManager extends Manager {
    constructor() {
        super();
        this.cleverbots = {};
    }


    talk(msg) {
        this.getCleverBot(msg.channel.guild.id).then( cleverbot => {
            cleverbot.talk(msg, (err, reply) => {
                if (err) {
                    console.error(err);
                    return msg.channel.createMessage(':x: An error with cleverbot occured!');
                }
                
                msg.channel.createMessage(':pencil: ' + reply);
            });
        }).catch(error => {
            console.error(error);
            return msg.channel.createMessage(':x: An error with cleverbot occured!');
        });
    }
    
    getCleverBot(guild_id) {
        return new Promise((resolve, reject) => {
            if(!guild_id) {
                return reject(new Error('Missing guild ID'));
            }
            
            if(this.cleverbots[guild_id]) {
                return resolve(this.cleverbots[guild_id]);
            }
            
            let cleverbot = new CleverBot(cleverbotUser, cleverbotKey, `wolke_rem_discordbot_${msg.channel.guild.id}`);
            
            cleverbot.createSession(guild_id, (cleverbotError) => {
                if(cleverbotError) {
                    return reject(cleverbotError);
                }
                
                //We try to create the cleverbot session before we actually store it so in case it fails, it won't try to talk to a clever bot that doesn't have a session.
                this.cleverbots[guild_id] = cleverbot;
                
                return resolve(cleverbot);
            });
        });
    }
}
class CleverBot {
    constructor(cleverbotUser, cleverbotKey, nick) {
        this.clever = new Clever({user: cleverbotUser, key: cleverbotKey, nick});
    }

    talk(msg, cb) {
        let msgClean = msg.content.replace(re, '');
        this.clever.setNick(`wolke_rem_discordbot_${msg.channel.guild.id}`);
        try {
            this.clever.askLegacy(msgClean, (err, res) => {
                if (err) return cb(err);
                cb(null, res);
            });
        } catch (e) {
            return cb(e);
        }
    }

    createSession(name, cb) {
        this.clever.setNick(`wolke_rem_discordbot_${name}`);
        try {
            this.clever.createLegacy((err, session) => {
                if (err) return cb(err);
                cb();
            });
        } catch (e) {
            return cb(e);
        }
    }
}
module.exports = {class: CleverBotManager, deps: [], async: false, shortcode: 'cm'};
