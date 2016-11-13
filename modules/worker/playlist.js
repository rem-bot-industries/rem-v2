/**
 * Created by julia on 13.11.2016.
 */
var Youtube = require('youtube-api');
var async = require('async');
var path = require("path");
var ytdl = require('ytdl-core');
var winston = require('winston');
var playlistModel = require(path.join(__dirname, '../../../DB/playlist'));
var count = 0;
self.onmessage = function (ev) {
    loadPlaylist(ev.data, (err, songs) => {
        self.postMessage({type: 'result', err: err, songs: songs});
    });
};
function loadPlaylist(id, cb) {
    Youtube.authenticate({
        type: 'key',
        key: config.youtube_api,
    });
    Youtube.playlistItems.list({
        part: 'contentDetails',
        maxResults: 50,
        playlistId: id,
    }, (err, data)=> {
        if (err) return winston.info(err);
        let songs = [];
        async.eachSeries(data.items, (item, cb) => {
            loadSong({
                url: `https://youtube.com/watch?v=${item.contentDetails.videoId}`,
                id: item.contentDetails.videoId
            }, (err, info) => {
                if (err) {
                    async.setImmediate(cb);
                } else {
                    songs.push(info.title);
                    prefetch(info);
                    async.setImmediate(cb);
                }
            });
        }, (err) => {
            if (err) return cb(err);
            cb(null, songs);
        })
    });
}
function loadSong(info, cb) {
    ytdl.getInfo(info.url, (err, info) => {
        if (err) {
            return cb(err);
        } else {
            info.id = info.video_id;
            cb(null, info);
        }
    });

}
function prefetch(info) {
    if (count < 5) {
        self.postMessage({type: 'info', info: info, count: count});
        count += 1;
    }
}