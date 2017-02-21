/**
 * Created by Julian/Wolke on 21.02.2017.
 */
let RRACommand = require('../../structures/rraCommand');
class Smug extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'smug';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = Smug;
