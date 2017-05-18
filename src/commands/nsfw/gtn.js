/**
 * Created by Julian/Wolke on 15.11.2016.
 */
let Command = require('../../structures/command');
let path = require('path');
let request = require('request');
let winston = require('winston');
class GtnImage extends Command {
    constructor({t}) {
        super();
        this.cmd = 'gtn';
        this.cat = 'nsfw';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // Force commands to only run in NSFW channels
        if (!msg.channel.name.startsWith('nsfw')) {
            return msg.channel.createMessage(this.t('nsfw-images.error-discord-not-nsfw-channel', {lngs: msg.lang}));
        }
        request.get('https://rra.ram.moe/i/r', {qs: {'type': 'nsfw-gtn', 'nsfw': true}}, (err, result, body) => {
            if (err) return winston.error(err);
            let parsedBody = JSON.parse(body);
            msg.channel.createMessage(`https://rra.ram.moe${parsedBody.path}`);
        });
    }
}
module.exports = GtnImage;