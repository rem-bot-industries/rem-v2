/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let adminId = require('../../../config/main.json').owner_id;
class ReloadLang extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'reloadLang';
        this.cat = 'admin';
        this.needGuild = false;
        this.hidden = true;
        this.t = t;
        this.accessLevel = 2;
        this.lm = mod.getMod('lm');
    }

    run(msg) {
        if (msg.author.id === adminId) {
            this.lm.reload();
        }
    }
}
module.exports = ReloadLang;