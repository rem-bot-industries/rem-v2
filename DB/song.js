/**
 * Created by julia on 26.06.2016.
 */
var mongoose = require('mongoose');
var songSchema = mongoose.Schema({
    title:String,
    alt_title:String,
    path:String,
    addedAt:Date,
    id:String,
    type:String,
    url:String,
    setId:String,
    dl:String,
    dlBy:String,
    plays:Number,
    favorites:Number,
    votes:Number,
    votedDownBy:[],
    votedUpBy:[],
    duration:String,
    user:Object,
    lastPlay: Date
});
songSchema.methods.updateVotes = function updateVotes(vote,cb) {
    this.model('Songs').update({id:this.id}, {$inc: {votes:vote}}, cb);
};
var songModel = mongoose.model('Songs', songSchema);
module.exports = songModel;