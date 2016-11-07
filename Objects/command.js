/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
class Command extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }
}
module.exports = Command;