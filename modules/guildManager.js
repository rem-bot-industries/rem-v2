/**
 * Created by julia on 10.11.2016.
 */
var EventEmitter = require('eventemitter3');
class CmdManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.commands = {};
        this.ready = false;
    }
    saveSong(song) {
        r.table("songs").insert({
            id: song.id,
            playCount:0,
            addedBy:song.addedBy,
            length:song.length,

        }).run(db.getConnection(), (err) => {
            if (err) return winston.info(err);
        });
    }
    searchSong(song) {

    }

}
module.exports = CmdManager;