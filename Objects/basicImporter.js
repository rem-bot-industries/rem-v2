/**
 * Created by julia on 08.11.2016.
 */
var EventEmitter = require('eventemitter3');
/**
 * The basic importer class
 * @extends EventEmitter
 *
 */
class BasicImporter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }
    loadSong(){

    }

}
module.exports = BasicImporter;