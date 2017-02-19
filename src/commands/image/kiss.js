/**
 * Created by Julian/Wolke on 19.02.2017
 */

let RRACommand = require('../../structures/rraCommand');
class KissImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'kiss';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = KissImage;
