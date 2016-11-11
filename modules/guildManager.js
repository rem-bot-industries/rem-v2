/**
 * Created by julia on 10.11.2016.
 */
var EventEmitter = require('eventemitter3');
class CmdManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.ready = false;
    }


}
module.exports = CmdManager;