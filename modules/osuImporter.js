/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
var Promise = require('bluebird');
var BasicImporter = require('../Objects/basicImporter');
var winston = require('winston');
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var winston = require('winston');
class OsuImporter extends BasicImporter {
    constructor(url) {
        super();
        this.url = url;
        this.loadSong();
    }

    loadSong() {
        this.osuMapDownload(this.url).then(Song => {
            this.emit('done', Song);
        }).catch(err => {
            console.error(err);
            this.emit('error', 'generic.error');
        });
    }

    osuMapDownload(url) {
        return new Promise((resolve, reject) => {
            this.downloadOsuMap(url).then((map) => {
                this.saveOsuMap(map).then((song) => {
                    resolve(song);
                }).catch(reject);
            }).catch(reject);
        });
    }

    downloadOsuMap(map) {
        return new Promise((resolve, reject) => {
            let loader = child_process.fork('./modules/worker/osu.js');
            loader.send({type: 'info', map: map});
            loader.once('message', (m) => {
                if (m.type === 'result') {
                    resolve(m.map)
                } else {
                    reject(m.err);
                }
                setTimeout(() => {
                    loader.kill();
                }, 2000)
            });
        });
    }

    saveOsuMap(map) {
        return new Promise((resolve, reject) => {
            fs.unlink(`temp/${map.beatmapSetId}.zip`, err => {
                if (err) reject(err);
                let info = {
                    title: `${map.artist} - ${map.title}`,
                    alt_title: map.alt_title,
                    addedAt: new Date(),
                    loaderUrl: map.link,
                    id: map.beatmapSetId,
                    type: "osuV2",
                    path: map.path,
                    user: {}
                };
                resolve(info);
            });
        });
    }
}
module.exports = OsuImporter;