/**
 * Created by julia on 29.12.2016.
 */
let request = require('request');
let async = require("async/index.js");
let key = require('../../config/main.json').youtube_api;
let search = (query, maxResults) => {
    return new Promise((resolve, reject) => {
        request.get(`https://www.googleapis.com/youtube/v3/search`, {
            qs: {
                part: 'id',
                key: key,
                q: query,
                maxResults: maxResults,
                type: "video"
            }
        }, (err, res, body) => {
            if (err) return reject(err);
            if (res.statusCode !== 200) {
                return reject(`Unkown Statuscode! Code: ${res.statusCode}`);
            }
            if (body) {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return reject(e);
                }
                let videos = [];
                async.each(body.items, (item, cb) => {
                    resolveVideo(item.id.videoId).then(video => {
                        videos.push(video);
                        cb();
                    }).catch(err => {
                        return cb(err);
                    });
                }, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(videos);
                });
            } else {
                return reject(`No body found!`);
            }
        });
    });
};
let resolveVideo = (id) => {
    return new Promise((resolve, reject) => {
        request.get(`https://www.googleapis.com/youtube/v3/videos`, {
            qs: {
                key: key,
                id: id,
                part: 'snippet'
            }
        }, (err, res, body) => {
            if (err) return reject(err);
            if (res.statusCode !== 200) {
                return reject(`Unkown Statuscode! Code: ${res.statusCode}`);
            }
            if (body) {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return reject(e);
                }
                if (typeof (body.items[0]) !== 'undefined') {
                    return resolve(body.items[0]);
                } else {
                    return reject(`No body found!`);
                }
            } else {
                return reject(`No body found!`);
            }
        });
    });
};
module.exports = {search, resolveVideo};
