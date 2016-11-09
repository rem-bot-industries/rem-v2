/**
 * Created by julia on 26.06.2016.
 */
var mongoose = require('mongoose');
var playlistSchema = mongoose.Schema({
    title:String,
    createdBy:String,
    serverPlaylist:Boolean,
    createdAt:Date,
    id:String,
    public:Boolean,
    songs:[]

});
var playlistModel = mongoose.model('Playlists', playlistSchema);
playlistSchema.methods.addSong = function addSong(song, cb) {
    this.model('Playlists').update({id: this.id}, {$addToSet: {songs: song}}, cb);
};
module.exports = playlistModel;
