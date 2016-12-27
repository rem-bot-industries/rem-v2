/**
 * Created by julia on 26.06.2016.
 */
let mongoose = require('mongoose');
let guildSchema = mongoose.Schema({
    id: String,
    lastVoiceChannel: String,
    nsfwChannel: String,
    nsfwChannels: [],
    roles: [],
    settings: [],
    prefix: {type: String, default: '!w.'},
    lng: {type: String, default: 'en'},
    levelEnabled: Boolean,
    pmNotifications: Boolean,
    chNotifications: Boolean,
    joinText: String,
    joinChannel: String,
    leaveText: String,
    leaveChannel: String
});
guildSchema.methods.updateVoice = function (id, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {lastVoiceChannel: id}}, cb);
};
guildSchema.methods.updateNsfw = function (id, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {nsfwChannel: id}}, cb);
};
guildSchema.methods.updatePms = function (bool, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {pmNotifications: bool}}, cb);
};
guildSchema.methods.updateLevels = function (bool, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {levelEnabled: bool}}, cb);
};
guildSchema.methods.updatePrefix = function (prefix, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {prefix: prefix}}, cb);
};
guildSchema.methods.updateLanguage = function (lng, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {lng: lng}}, cb);
};
guildSchema.methods.updateVolume = function (volume, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {volume: volume}}, cb);
};
guildSchema.methods.updateChannel = function (bool, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {chNotifications: bool}}, cb);
};
guildSchema.methods.setJoin = function (message, channel, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {joinText: message, joinChannel: channel}}, cb);
};
guildSchema.methods.setLeave = function (message, channel, cb) {
    this.model('Guilds').update({id: this.id}, {$set: {leaveText: message, leaveChannel: channel}}, cb);
};
guildSchema.methods.addRole = function (role, cb) {
    this.model('Guilds').update({id: this.id}, {$addToSet: {roles: role}}, cb);
};
let guildModel = mongoose.model('Guilds', guildSchema);
module.exports = guildModel;