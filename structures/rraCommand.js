/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let request = require("request");
let winston = require("winston");
/**
 * The base command class
 * @extends EventEmitter
 *
 */
class Command extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }

    /**
     * The main function of the command
     * @param {Object} msg
     */
    run(msg) {
        request.get('https://rra.ram.moe/i/r', {qs: {"type": this.cmd}}, (err, result, body) => {
            if (err) return winston.error(err);
            try {
                body = JSON.parse(body);
            } catch (e) {
                return winston.error(e);
            }
            msg.channel.createMessage(`https://rra.ram.moe${body.path}`);
        });
    }
}
module.exports = Command;