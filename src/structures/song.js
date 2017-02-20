/**
 * Created by Julian/Wolke on 06.01.2017.
 */
let shortid = require('shortid');
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