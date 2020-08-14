/**
 * Created on 14.08.2020
 */
const cfg = require('../../config/main.json');
let RRACommand = require('../../structures/rraCommand');
let winston = require('winston');

class HandholdImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'handhold';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    async run(msg) {
        if (!cfg.use_weeb) {
            winston.debug('Handhold imagetype isn\'t available on the rra.ram.moe API.');
            return msg.channel.createMessage('This command is unavailable at the moment.');
        }
        return await super.run(msg);
    }
}
module.exports = HandholdImage;
