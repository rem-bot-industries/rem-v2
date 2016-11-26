/**
 * Created by julia on 13.11.2016.
 */
let Youtube = require('youtube-api');
let async = require('async');
let path = require("path");
let ytdl = require('ytdl-core');
let winston = require('winston');
let songModel = require('../../DB/song');
let config = require('../../config/main.json');
let count = 0;
let fs = require('fs');
let maxResults = 0;
let defaultSongs = 50;
let loaded = 0;
let songs = [];
process.on('message', (ev) => {
    console.log(ev);
    init();
    importPlaylist(ev.id, null, (err, songs) => {
        process.send({type: 'result', err: err, songs: songs});
    });
});
function init() {
    Youtube.authenticate({
        type: 'key',
        key: config.youtube_api,
    });
}
function loadPlaylist(id, nextPageToken, cb) {
    let options = {
        part: 'contentDetails',
        maxResults: defaultSongs,
        playlistId: id,
    };
    if (nextPageToken) {
        options.pageToken = nextPageToken;
    }
    Youtube.playlistItems.list(options, (err, data)=> {
        if (err) return winston.info(err);
        if (maxResults === 0) {
            maxResults = data.pageInfo.totalResults;
        }
        cb(null, data)
    });
}
function importPlaylist(id, token, cb) {
    loadPlaylist(id, token, (err, data) => {
        if (err) return cb(err);
        async.eachSeries(data.items, (item, cb) => {
            loadSong({
                url: `https://youtube.com/watch?v=${item.contentDetails.videoId}`,
                id: item.contentDetails.videoId
            }, (err, info) => {
                if (err) {
                    async.setImmediate(cb);
                } else {
                    info.id = info.video_id;
                    info.loaderUrl = `https://www.youtube.com/watch?v=${info.id}`;
                    songs.push(info);
                    if (loaded < 5) {
                        prefetch(info);
                    } else {
                        importSong(info);
                    }
                    console.log(`${loaded} ${info.title}`);
                    loaded += 1;
                    async.setImmediate(cb);
                }
            });
        }, (err) => {
            if (err) return cb(err);
            if (data.nextPageToken) {
                console.log(data.nextPageToken);
                importPlaylist(id, data.nextPageToken, cb);
            } else {
                cb(null, songs);
            }
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
    process.send({type: 'info', info: info, count: loaded});
}
function importSong(info) {
    process.send({type: 'fetchOne', info: info});
}