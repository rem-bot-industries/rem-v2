/**
 * Created by julia on 08.11.2016.
 */
let BasicImporter = require('../Objects/basicImporter');
let winston = require('winston');
let path = require("path");
let playlistModel = require('../DB/playlist');
let child_process = require("child_process");
let shortid = require('shortid');
let ytdl = require('ytdl-core');
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
        for (let i = 0; i < songs.length; i++) {
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