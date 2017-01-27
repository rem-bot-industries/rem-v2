/**
 * Created by Julian/Wolke on 23.07.2016.
 */
let mongoose = require('mongoose');
let statSchema = mongoose.Schema({
    id: String,
    userId: String,
    guildId: {type: String, default: 'PM'},
    date: {type: Date, default: Date.now()},
    run: Boolean,
    reason: String,
    cmd: String,
    content: String
});
let statModel = mongoose.model('statistics', statSchema);
module.exports = statModel;