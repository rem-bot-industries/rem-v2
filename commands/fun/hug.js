/**
 * Created by julia on 15.11.2016.
 */
let RRACommand = require('../../structures/rraCommand');
class HugImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = "hug";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = HugImage;
