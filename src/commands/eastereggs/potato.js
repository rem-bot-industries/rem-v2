/**
 * Created by Julian/Wolke on 25.01.2017.
 */
let RRACommand = require('../../structures/rraCommand');
class Potato extends RRACommand {
    constructor({t}) {
        super();
        this.cmd = 'potato';
        this.cat = 'eastereggs';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }
}
module.exports = Potato;
