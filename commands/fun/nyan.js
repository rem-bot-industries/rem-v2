/**
 * Created by julia on 15.11.2016.
 */

let RRACommand = require('../../structures/rraCommand');
class NyanImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "nyan";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = NyanImage;