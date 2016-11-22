/**
 * Created by julia on 08.11.2016.
 */
var BasicImporter = require('../Objects/basicImporter');
var winston = require('winston');
var path = require("path");
var playlistModel = require('../DB/playlist');
var child_process = require("child_process");
var shortid = require('shortid');
var ytdl = require('ytdl-core');
/**
 * The playlist importer
 * @extends BasicImporter
 *
 */
class PlaylistImporter extends BasicImporter {
    constructor(id) {
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
            } else if (m.type === 'fetchOne') {
                this.emit('one', m.info);
            } else {
                if (m.err) {
                    winston.error(m.err);
                    this.emit('error', 'generic.error');
                } else {
                    // this.emit('done', m.songs);
                    loader.kill();
                    this.createPlaylist(m.songs);
                }
            }
        });
    }

    createPlaylist(songs) {
        let songsId = [];
        for (var i = 0; i < songs.length; i++) {
            songsId.push(songs[i].id);
        }
        let playlist = new playlistModel({
            title: `Wolke-${this.id}`,
            createdBy: 'Wolke',
            guildPlaylist: false,
            ytid: this.id,
            id: shortid.generate(),
            songs: songsId
        });
        playlist.save((err) => {
            if (err) {
                winston.error(err);
                return this.emit('error', 'generic.error');
            }
            this.emit('done', playlist, songs);
        });
    }
}
module.exports = PlaylistImporter;