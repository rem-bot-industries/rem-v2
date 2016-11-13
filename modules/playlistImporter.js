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
            if (ev.data.type === 'info') {
                this.emit('prefetch', ev.data.info, ev.data.count);
            } else {
                if (ev.data.err) {
                    winston.error(ev.data.err);
                    this.emit('error', 'generic.error');
                } else {
                    this.emit('done', ev.data.songs);
                    loader.terminate();
                }
            }
        }
    }
}
module.exports = PlaylistImporter;