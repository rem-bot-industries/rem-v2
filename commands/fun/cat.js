/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let request = require("request");
class Cat extends Command {
    constructor({t}) {
        super();
        this.cmd = "cat";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        request.get('http://random.cat/meow', (err, response, body) => {
            if (err) return winston.info(err);
            let parsedBody = JSON.parse(body);
            let url = parsedBody.file.replace('\\', 'g');
            msg.channel.createMessage(url);
        });
    }
}
module.exports = Cat;