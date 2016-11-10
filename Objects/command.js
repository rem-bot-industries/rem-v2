/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
/**
 * The base command class
 * @extends EventEmitter
 *
 */
class Command extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }
}
module.exports = Command;