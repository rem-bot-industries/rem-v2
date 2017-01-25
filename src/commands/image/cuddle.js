/**
 * Created by Julian/Wolke on 15.11.2016.
 */

let RRACommand = require('../../structures/rraCommand');
class CuddleImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "cuddle";
        this.cat = "image";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = CuddleImage;