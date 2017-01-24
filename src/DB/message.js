/**
 * Created by Julian/Wolke on 23.07.2016.
 */
let mongoose = require('mongoose');
let messageSchema = mongoose.Schema({
    id: String,
    content: String,
    authorId: String,
    channelId: String,
    time: Date,
    guildId: String,
    name: String
});
let messageModel = mongoose.model('Messages', messageSchema);
module.exports = messageModel;