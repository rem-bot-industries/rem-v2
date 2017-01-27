/**
 * Created by Julian/Wolke on 10.07.2016.
 */
let mongoose = require('mongoose');
let queueSchema = mongoose.Schema({
    id: String,
    voteskips: [],
    repeat: {type: String, default: 'off'},
    songs: [],
    time: {type: String, default: ''}
});
queueSchema.methods.setSongs = function (songs, cb) {
    this.model('Queues').update({server: this.server}, {$set: {songs: songs}}, cb);
};
queueSchema.methods.removeOldest = function (cb) {
    this.model('Queues').update({server: this.server}, {$pop: {songs: 1}}, cb);
};
queueSchema.methods.updateTitle = function (id, title, cb) {
    this.model('Queues').update({server: this.server, 'songs.id': id}, {$set: {'songs.$.title': title}}, cb);
};
let queueModel = mongoose.model('Queues', queueSchema);
module.exports = queueModel;