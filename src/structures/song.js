/**
 * Created by Julian/Wolke on 06.01.2017.
 */
let shortid = require('shortid');
class Song {
    constructor({id, type, title, url, needsResolve, local, duration, streamUrl, live, needsYtdl, isOpus, queuedBy}) {
        this.id = id;
        this.type = type;
        this.url = url;
        this.local = local;
        this.duration = duration;
        this.needsYtdl = needsYtdl;
        this.needsResolve = needsResolve;
        this.isResolved = !this.needsResolve;
        this.isOpus = isOpus;
        this.streamUrl = streamUrl;
        this.title = title ? title : 'unresolved';
        this.qid = shortid.generate();
        this.live = live;
        this.queuedBy = queuedBy
    }
}
module.exports = Song;