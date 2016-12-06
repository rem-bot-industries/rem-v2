/**
 * Created by julia on 15.11.2016.
 */
let Command = require('../../Objects/command');
let request = require("request");
let winston = require('winston');
class NyanImage extends Command {
    constructor(t) {
        super();
        this.cmd = "nyan";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        request.get('https://rra.ram.moe/i/r', {qs: {"type": "nyan"}}, (err, result, body) => {
            if (err) return winston.error(err);
            let parsedBody = JSON.parse(body);
            msg.channel.createMessage(`https://rra.ram.moe${parsedBody.path}`);
        });
    }
}
module.exports = NyanImage;