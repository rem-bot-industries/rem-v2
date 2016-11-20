/**
 * Created by julia on 08.11.2016.
 */
var BasicImporter = require('../Objects/basicImporter');
var winston = require('winston');
var path = require("path");
var Worker = require("tiny-worker");
var child_process = require("child_process");
/**
 * The playlist importer
 * @extends BasicImporter
 *
 */
class PlaylistImporter extends BasicImporter {
    constructor(id, ytdl) {
        super();
        this.id = id;
        this.dl = ytdl;
        this.loadPlaylist(this.id);
    }

    loadPlaylist(id) {
        let loader = child_process.fork(path.join(__dirname, './worker/playlist.js'));
        loader.send({type: 'info', id: id});
        loader.on('message', (m) => {
            console.log(JSON.stringify(m.type));
            if (m.type === 'info') {
                this.emit('prefetch', m.info, m.count);
            } else {
                if (m.err) {
                    winston.error(m.err);
                    this.emit('error', 'generic.error');
                } else {
                    this.emit('done', m.songs);
                    loader.kill();
                }
            }
        });
    }
}
module.exports = PlaylistImporter;