/**
 * Created by julia on 04.01.2017.
 */
let RRACommand = require('../../structures/rraCommand');
class CryImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "cry";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = CryImage;
