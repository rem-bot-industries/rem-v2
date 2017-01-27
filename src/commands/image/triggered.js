/**
 * Created by Julian/Wolke on 15.11.2016.
 */
let RRACommand = require('../../structures/rraCommand');
class TriggeredImage extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'triggered';
        this.cat = 'image';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }
}
module.exports = TriggeredImage;
