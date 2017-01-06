/**
 * Created by julia on 08.11.2016.
 */
let BasicImporter = require('../../structures/basicImporter');
let winston = require('winston');
let request = require('request');
let Song = require('../../structures/song');
let SongTypes = require('../../structures/constants').SONG_TYPES;
let YtResolver = require('./youtubeResolver');
let shortid = require('shortid');
/**
 * The playlist importer
 * @extends BasicImporter
 *
 */
class PlaylistImporter extends BasicImporter {
    constructor() {
        super();
    }

    loadPlaylist(id, cb) {
        request.get(`https://www.youtube.com/list_ajax?style=json&action_get_list=1&list=${id}`, (err, res, body) => {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return cb(e);
            }
            if (!body || !body.video) {
                return cb(`This id (${id}) seems bad.`);
            }
            let playlist = {title: body.title, author: body.author};
            let songs = [];
            for (let i = 0; i < body.video.length; i++) {
                let video = body.video[i];
                let song = new Song({
                    id: video.encrypted_id,
                    type: SongTypes.youtube,
                    duration: video.duration,
                    url: `https://www.youtube.com/watch?v=${video.encrypted_id}`,
                    needsResolve: true,
                    title: video.title,
                    local: false
                });
                songs.push(song);
            }
            let ytr = new YtResolver();
            ytr.resolveSong(songs[0]).then(resolvedSong => {
                songs[0] = resolvedSong;
                playlist.songs = songs;
                cb(null, playlist);
            }).catch(err => cb(err));

        });
    }
}
module.exports = PlaylistImporter;