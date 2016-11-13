/**
 * Created by julia on 13.11.2016.
 */
var Youtube = require('youtube-api');
var async = require('async');
var path = require("path");
var config = require(path.join(__dirname, '../../../config/main.json'));
var ytdl = require('ytdl-core');
var winston = require('winston');
var playlistModel = require(path.join(__dirname, '../../../DB/playlist'));
self.onmessage = function (ev) {
    loadPlaylist(ev.data, (err, songs) => {
        self.postMessage({err: err, songs: songs});
        self.terminate();
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
        async.eachLimit(data.items, 20, (item, cb) => {
            loadSong(`https://youtube.com/watch?v=${item.contentDetails.videoId}`, (err, info) => {
                if (err) {
                    async.setImmediate(cb);
                } else {
                    songs.push(info.title);
                    async.setImmediate(cb);
                }
            });
        }, (err) => {
            if (err) return cb(err);
            cb(null, songs);
        })
    });
}
function loadSong(url, cb) {
    ytdl.getInfo(url, (err, info) => {
        if (err) {
            return cb(err);
        } else {
            info.id = info.video_id;
            cb(null, info);
        }
    });
}