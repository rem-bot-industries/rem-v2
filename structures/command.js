/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
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
    /**
     * The main function of the command
     * @param {Object} msg
     */
    run(msg) {

    }
}
module.exports = Command;