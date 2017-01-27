/**
 * Created by julia on 27.01.2017.
 */
let Command = require('../../structures/command');
let axios = require('axios');
class UrbanDictionary extends Command {
    constructor({t}) {
        super();
        this.cmd = 'define';
        this.cat = 'misc';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    async run(msg) {
        let term = msg.content.substring(msg.prefix.length + this.cmd.length + 1);
    }
}
module.exports = UrbanDictionary;