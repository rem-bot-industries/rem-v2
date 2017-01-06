/**
 * Created by julia on 15.11.2016.
 */
let RRACommand = require('../../structures/rraCommand');
class RemImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "rem";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = RemImage;
