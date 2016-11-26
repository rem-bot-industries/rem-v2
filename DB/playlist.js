/**
 * Created by julia on 26.06.2016.
 */
let mongoose = require('mongoose');
let playlistSchema = mongoose.Schema({
    title:String,
    createdBy:String,
    guildPlaylist: Boolean,
    createdAt:Date,
    id:String,
    ytid: String,
    public:Boolean,
    songs:[]
});
let playlistModel = mongoose.model('Playlists', playlistSchema);
playlistSchema.methods.addSong = function addSong(song, cb) {
    this.model('Playlists').update({id: this.id}, {$addToSet: {songs: song}}, cb);
};
module.exports = playlistModel;
