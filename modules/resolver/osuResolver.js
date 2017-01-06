/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
let BasicImporter = require('../../structures/basicImporter');
let winston = require('winston');
let fs = require("fs");
let path = require("path");
let child_process = require("child_process");
const types = require('../../structures/constants').SONG_TYPES;
const Song = require('../../structures/song');
let config = require('../../config/main.json');
const osu = require('node-osu');
let osuApi = new osu.Api(config.osu_token);
let setRegex = /.*http(s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|)/;
let notAvailableRegex = /This download is no longer available/i;
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

    resolveBeatmap(url) {
        return new Promise(function (resolve, reject) {
            let map = url;
            let mapType = JSON.parse('{"' + map.replace(setRegex, '$2') + '": ' + map.replace(setRegex, '$3') + '}');
            osuApi.getBeatmaps(mapType).then(beatmaps => {
                if (beatmaps.length > 0) {
                    let beatmap = beatmaps[0];
                    resolve(beatmap);
                } else {
                    reject('No beatmaps received!');
                }
            }).catch(err => reject(err));
        });
    }

    checkExist(beatmap) {
        return new Promise(function (resolve, reject) {
            fs.access(`audio/${beatmap.beatmapSetId}.mp3`, 'r', (err) => {
                if (err) {
                    reject(err);
                } else {
                    beatmap.path = `audio/${beatmap.beatmapSetId}.mp3`;
                    resolve(beatmap);
                }
            });
        });
    }

    osuMapDownload(url) {
        return new Promise((resolve, reject) => {
            this.resolveBeatmap(url).then(this.checkExist).then(map => {
                resolve(this.saveOsuMap(map));
            }).catch(err => {
                winston.info(err);
                this.downloadOsuMap(url).then((map) => {
                    this.deleteZip(`temp/${map.beatmapSetId}.zip`).then(() => {
                        resolve(this.saveOsuMap(map));
                    }).catch(reject);
                }).catch(reject);
            });
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

    deleteZip(path) {
        return new Promise(function (resolve, reject) {
            fs.unlink(path, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    saveOsuMap(map) {
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
        return new Song({
            id: info.id,
            title: info.title,
            type: types.osu,
            local: true,
            url: info.path
        });
    }
}
module.exports = OsuImporter;