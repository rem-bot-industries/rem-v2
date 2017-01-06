/**
 * Created by julia on 15.11.2016.
 */
let RRACommand = require('../../structures/rraCommand');
class KermitImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "kermit";
        this.cat = "eastereggs";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }
}
module.exports = KermitImage;
