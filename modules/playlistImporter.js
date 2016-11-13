/**
 * Created by julia on 08.11.2016.
 */
/**
 * The playlist importer
 * @extends EventEmitter
 *
 */
var BasicImporter = require('../Objects/basicImporter');
var winston = require('winston');
var path = require("path");
var Worker = require("tiny-worker");
class PlaylistImporter extends BasicImporter {
    constructor(id, ytdl) {
        super();
        this.id = id;
        this.dl = ytdl;
        this.loadPlaylist(this.id);
    }

    loadPlaylist(id) {
        var loader = new Worker(path.join(__dirname, './worker/playlist.js'));
        loader.postMessage(id);
        loader.onmessage = (ev) => {
            // console.log(ev.data);
            if (ev.data.err) {
                this.emit('error', ev.data.err);
            } else {
                this.emit('done', ev.data.songs);
            }
        }
    }
}
module.exports = PlaylistImporter;