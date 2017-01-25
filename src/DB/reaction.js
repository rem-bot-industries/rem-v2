/**
 * Created by Julian/Wolke on 23.07.2016.
 */
let mongoose = require('mongoose');
let reactionSchema = mongoose.Schema({
    id: String,
    guildId: String,
    trigger: String,
    response: String,
    type: String
});
let reactionModel = mongoose.model('Reactions', reactionSchema);
module.exports = reactionModel;