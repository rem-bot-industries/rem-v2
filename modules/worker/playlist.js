/**
 * Created by julia on 13.11.2016.
 */
var Youtube = require('youtube-api');
var async = require('async');
var path = require("path");
var ytdl = require('ytdl-core');
var winston = require('winston');
var playlistModel = require('../../DB/playlist');
var config = require('../../config/main.json');
var count = 0;
process.on('message', (ev) => {
    console.log(ev);
    loadPlaylist(ev.id, (err, songs) => {
        process.send({type: 'result', err: err, songs: songs});
    });
});
function loadPlaylist(id, cb) {
    console.log('loading data ' + id);
    Youtube.authenticate({
        type: 'key',
        key: config.youtube_api,
    });
    console.log('logged in!');
    Youtube.playlistItems.list({
        part: 'contentDetails',
        maxResults: 50,
        playlistId: id,
    }, (err, data)=> {
        if (err) return winston.info(err);
        let songs = [];
        // console.log('received data');
        // winston.info(data);
        // console.log('OwO');
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
        console.log('prefetch');
        process.send({type: 'info', info: info, count: count});
        count += 1;
    }
}