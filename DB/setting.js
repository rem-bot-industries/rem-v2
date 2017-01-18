/**
 * Created by julia on 27.12.2016.
 */
let mongoose = require('mongoose');
let settingsSchema = mongoose.Schema({
    id: String,
    type: String,
    key: String,
    value: String
});
let settingModel = mongoose.model('Settings', settingsSchema);
module.exports = settingModel;