/**
 * Created by julia on 15.11.2016.
 */
let Command = require('../../Objects/command');
let request = require("request");
let winston = require('winston');
class KermitImage extends Command {
    constructor(t) {
        super();
        this.cmd = "kermit";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        request.get('https://rra.ram.moe/i/r', {qs: {"type": "kermit"}}, (err, result, body) => {
            if (err) return winston.error(err);
            let parsedBody = JSON.parse(body);
            msg.channel.createMessage(`https://rra.ram.moe${parsedBody.path}`);
        });
    }
}
module.exports = KermitImage;
