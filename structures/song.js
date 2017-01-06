/**
 * Created by julia on 06.01.2017.
 */
const types = require('./constants').SONG_TYPES;
class Song {
    constructor({id, type, title, url, needsResolve, local, duration, streamUrl, needsYtdl}) {
        this.id = id;
        this.type = type;
        this.url = url;
        this.local = local;
        this.duration = duration;
        this.needsYtdl = needsYtdl;
        this.needsResolve = needsResolve;
        this.isResolved = !this.needsResolve;
        this.streamUrl = streamUrl;
        this.title = title ? title : 'unresolved';
    }

    resolve() {
        //TODO NOT USED AT THE MOMENT!
        let that = this;
        return new Promise(function (resolve, reject) {
            switch (that.type) {
                case types.youtube:
                    return;
                case types.soundcloud:
                    return;
                case types.osu:
                    return;
            }
        });
    }
}
module.exports = Song;