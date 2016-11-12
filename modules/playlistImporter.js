/**
 * Created by julia on 08.11.2016.
 */
/**
 * The playlist importer
 * @extends EventEmitter
 *
 */
var BasicImporter = require('../Objects/basicImporter');
var playlistModel = require('../DB/playlist');
var config = require('../config/main.json');
var winston = require('winston');
var Youtube = require('youtube-api');
class PlaylistImporter extends BasicImporter {
    constructor(id, ytdl) {
        super();
        this.id = id;
        this.dl = ytdl;
        this.loadPlaylist(this.id);
    }

    loadSong(cb) {
        this.dl.getInfo(this.url, (err, info) => {
            if (err) {
                return cb(err);
            } else {
                info.id = info.video_id;
                cb(null.info);
            }
        });
    }

    loadPlaylist(id) {
        Youtube.authenticate({
            type: 'key',
            key: config.youtube_api,
        });
        Youtube.playlistItems.list({
            part: 'contentDetails',
            maxResults: 50,
            playlistId: id,
        }, function (err, data) {
            if (err) return winston.info(err);
            console.log(data);
        });
    }
}
module.exports = PlaylistImporter;