/**
 * Created by julia on 06.01.2017.
 */
let shortid = require("shortid");
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
        this.qid = shortid.generate();
    }
}
module.exports = Song;