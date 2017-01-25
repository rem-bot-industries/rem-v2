/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let request = require("request");
class Dog extends Command {
    constructor({t}) {
        super();
        this.cmd = "dog";
        this.cat = "image";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        request.get('http://random.dog/woof', (err, response, body) => {
            if (err) return winston.info(err);
            msg.channel.createMessage(`http://random.dog/${body}`);
        });
    }
}
module.exports = Dog;