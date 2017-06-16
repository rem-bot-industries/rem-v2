/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let axios = require('axios');
class Cat extends Command {
    constructor({t}) {
        super();
        this.cmd = 'cat';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    async run(msg) {
        try {
            let req = await axios.get('http://random.cat/meow');
            let url = req.data.file.replace('\\', 'g');
            msg.channel.createMessage(url);
        } catch (e) {
            winston.error(e);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = Cat;