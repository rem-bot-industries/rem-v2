/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
const cfg = require('../../config/main.json');
let axios = require('axios');
let winston = require("winston");

/**
 * The base command class
 * @extends EventEmitter
 *
 */
class Command extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * The main function of the command
     * @param {Object} msg
     */
    async run(msg) {
        try {
            if (cfg.use_weeb) {
                let res = await axios.get('https://api.weeb.sh/images/random', {
                    headers: {Authorization: cfg.weebsh_token},
                    params: {"type": this.cmd === 'nyan' ? 'neko' : this.cmd}
                });
                return msg.channel.createMessage(res.data.url);
            } else {
                let res = await axios.get('https://rra.ram.moe/i/r', {params: {"type": this.cmd}});
                let path = res.data.path.replace('/i/', '');
                return msg.channel.createMessage(`https://cdn.ram.moe/${path}`);
            }
        } catch (e) {
            return winston.error(e);
        }
    }
}

module.exports = Command;