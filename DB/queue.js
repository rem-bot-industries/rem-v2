/**
 * Created by julia on 10.07.2016.
 */
let mongoose = require('mongoose');
let queueSchema = mongoose.Schema({
    server:String,
    voteSkip:Number,
    repeat:Boolean,
    repeatId:String,
    voteSkipVotes:[],
    songs:[]
});
queueSchema.methods.updateVotes = function updateVotes(Id, cb) {
    this.model('Queues').update({server:this.server}, {$inc:{voteSkip:1}, $addToSet:{voteSkipVotes:Id}}, cb);
};
queueSchema.methods.resetVotes = function resetVotes(cb) {
    this.model('Queues').update({server:this.server}, {$set:{voteSkip:0, voteSkipVotes:[]}}, cb);
};
queueSchema.methods.reload = function reload(cb) {
    this.model('Queues').findOne({server:this.server}, cb);
};
queueSchema.methods.removeLatest = function (cb) {
    this.model('Queues').update({server:this.server},{$pop: {songs: 1}}, cb);
};
queueSchema.methods.clear = function (songs, cb) {
    this.model('Queues').update({server:this.server},{$set:{songs:songs}}, cb);
};
queueSchema.methods.removeOldest = function (cb) {
    this.model('Queues').update({server:this.server},{$pop: {songs: 1}}, cb);
};
queueSchema.methods.startRepeat = function (cb) {
    this.model('Queues').update({server:this.server},{$set:{repeat:true}}, cb);
};
queueSchema.methods.stopRepeat = function (cb) {
    this.model('Queues').update({server:this.server},{$set: {repeat:false, repeatId:""}}, cb);
};
queueSchema.methods.updateRepeatId = function (id,cb) {
    this.model('Queues').update({server:this.server},{$set: {repeatId:id}}, cb);
};
queueSchema.methods.checkVote = function checkVote(Id,cb) {
    this.model('Queues').findOne({voteSkipVotes:Id, server:this.server}, function (err,Queue) {
        if (err) return cb(err);
        if (Queue) {
            return cb(null, true);
        } else {
            return cb(null, false);
        }
    });
};

queueSchema.methods.updateTitle = function (id, title, cb) {
    this.model('Queues').update({server: this.server, 'songs.id': id}, {$set: {'songs.$.title': title}}, cb);
};
let queueModel = mongoose.model('Queues', queueSchema);
module.exports = queueModel;