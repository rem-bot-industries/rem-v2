/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
// var db = require('./dbManager');
// var r = db.getR();
var request = require('request');
request = request.defaults({jar: true});
var config = require('../config/main.json');
var BasicImporter = require('../Objects/basicImporter');
const osu = require('node-osu');
var osuApi = new osu.Api(config.osu_token);
var winston = require('winston');
var fs = require("fs");
var shortid = require('shortid');
var unzip = require('unzip');
class OsuImporter extends BasicImporter {
    constructor(url) {
        super();
        this.url = url;
        this.loadSong();
    }

    loadSong() {
        this.osuMapDownload(this.url).then(Song => {
            console.log(Song);
        }).catch(winston.error);
    }

    osuMapDownload(url) {
        return new Promise((resolve, reject) => {
            this.downloadOsuMap(url).then((map) => {
                this.unpackOsuMap(map).then(map => {
                    this.saveOsuMap(map).then((song) => {
                        resolve(song);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }

    downloadOsuMap(url) {
        return new Promise((resolve, reject) => {
            let setRegex = /.*http(s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|)/;
            let notAvailableRegex = /This download is no longer available/i;
            let map = url;
            let mapType = JSON.parse('{"' + map.replace(setRegex, '$2') + '": ' + map.replace(setRegex, '$3') + '}');
            console.log(mapType);
            osuApi.getBeatmaps(mapType).then(beatmaps => {
                if (beatmaps.length > 0) {
                    console.log(beatmaps);
                    let setId = beatmaps[0].beatmapSetId;
                    let beatmap = beatmaps[0];
                    request.post({
                        url: "https://osu.ppy.sh/forum/ucp.php?mode=login",
                        formData: {
                            login: "Login",
                            password: config.osu_password,
                            username: config.osu_username
                        }
                    }, (err, res, body) => {
                        if (err) reject(err);
                        let url = 'http://osu.ppy.sh/d/' + setId;
                        let stream = fs.createWriteStream(`temp/${setId}.zip`);
                        request.get(url, (err, res, body) => {
                            if (err) {
                                reject('Internal Error!');
                            }
                            if (notAvailableRegex.test(body)) {
                                stream.end();
                                reject(`${beatmap.artist} ${beatmap.title} is not available to download`);
                            }
                        }).pipe(stream).on('finish', () => {
                            stream.end();
                            beatmap.path = `temp/${setId}.zip`;
                            beatmap.link = map;
                            resolve(beatmap);
                        });
                    });
                }
            }).catch(reject);
        });
    }

    unpackOsuMap(map) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(map.path)
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    var audioReg = /.*\.(?:mp3|ogg)/g;
                    var fileName = entry.path;
                    var type = entry.type; // 'Directory' or 'File'
                    if (audioReg.test(fileName) && type === 'File') {
                        map.fileId = shortid.generate();
                        map.path = `audio/osu/${map.fileId}.mp3`;
                        try {
                            entry.pipe(fs.createWriteStream(map.path));
                        } catch (e) {
                            reject(e);
                        }
                        resolve(map);
                    } else {
                        entry.autodrain();
                    }
                });
            setTimeout(() => {
                reject('No Song Found!');
            }, 10000);
        });
    }

    saveOsuMap(map) {
        return new Promise((resolve, reject) => {
            fs.unlink(`temp/${map.beatmapSetId}.zip`, err => {
                if (err) reject(err);
                let info = {title: `${map.artist} - ${map.title}`, alt_title: map.alt_title, loaderUrl: map.link};
                resolve(info);
            });
        });
    }
}
module.exports = OsuImporter;