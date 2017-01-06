let fs = require("fs");
let Promise = require('bluebird');
let path = require("path");
let unzip = require("unzip");
let config = require('../../config/main.json');
const osu = require('node-osu');
let osuApi = new osu.Api(config.osu_token);
let request = require('request');
let shortid = require("shortid");
request = request.defaults({jar: true});
process.on('message', (ev) => {
    downloadOsuMap(ev.map).then(map => {
        unpackOsuMap(map).then(map => {
            process.send({type: 'result', map: map});
        }).catch(err => {
            console.log(err);
            process.send({type: 'err', err: err})
        });
    }).catch(err => {
        console.log(err);
        process.send({type: 'err', err: err})
    });
});
function downloadOsuMap(url) {
    return new Promise((resolve, reject) => {
        let setRegex = /.*http(s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|)/;
        let notAvailableRegex = /This download is no longer available/i;
        let map = url;
        let mapType = JSON.parse('{"' + map.replace(setRegex, '$2') + '": ' + map.replace(setRegex, '$3') + '}');
        osuApi.getBeatmaps(mapType).then(beatmaps => {
            if (beatmaps.length > 0) {
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
                    let url = 'http://osu.ppy.sh/d/' + beatmap.beatmapSetId;
                    let stream = fs.createWriteStream(`temp/${beatmap.beatmapSetId}.zip`);
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
                        beatmap.path = `temp/${beatmap.beatmapSetId}.zip`;
                        beatmap.link = map;
                        resolve(beatmap);
                    });
                });
            }
        }).catch(reject);
    });
}
function unpackOsuMap(map) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(map.path)
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                let audioReg = /.*\.(?:mp3|ogg)/g;
                let fileName = entry.path;
                let type = entry.type; // 'Directory' or 'File'
                if (audioReg.test(fileName) && type === 'File') {
                    map.path = `audio/${map.beatmapSetId}.mp3`;
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