/**
 * Created by Julian/Wolke on 04.01.2017.
 */
let RRACommand = require('../../structures/rraCommand');
class LickImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'lick';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = LickImage;
