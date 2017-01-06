/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let msgModel = require('../../DB/message');
let winston = require('winston');
class SayDelete extends Command {
    constructor({t}) {
        super();
        this.cmd = "sayd";
        this.cat = "fun";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let content = msg.content.substr(msg.prefix.length + this.cmd.length).trim();
        msg.trueContent = content;
        msg.channel.createMessage('\u200B' + content).then(newMsg => {
            msg.id = newMsg.id;
            this.save(msg);
        });
        msg.delete()
            .then()
            .catch(console.error);
    }

    save(msg) {
        let message = new msgModel({
            id: msg.id,
            authorId: msg.author.id,
            channelId: msg.channel.id,
            content: msg.trueContent,
            time: Date.now(),
            guildId: msg.guild.id,
            name: msg.author.username + '#' + msg.author.discriminator
        });
        message.save((err) => {
            if (err) return winston.error(err);
        });
    }
}
module.exports = SayDelete;