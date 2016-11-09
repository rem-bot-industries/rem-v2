/**
 * Created by julia on 26.06.2016.
 */
var mongoose = require('mongoose');
var serverSchema = mongoose.Schema({
    id: String,
    lastVoiceChannel: String,
    nsfwChannel: String,
    nsfwChannels: [],
    roles: [],
    cmdChannels: [],
    ignoreChannels: [],
    permissions: [],
    prefix: String,
    disabledCmds: [],
    levelUpRewards: [],
    Groups: [],
    Blacklist: [],
    lng: String,
    levelEnabled: Boolean,
    pmNotifications: Boolean,
    chNotifications: Boolean,
    volume: Number,
    joinText: String,
    joinChannel: String,
    leaveText: String,
    leaveChannel: String
});
serverSchema.methods.updateVoice = function (id, cb) {
    this.model('Servers').update({id: this.id}, {$set: {lastVoiceChannel: id}}, cb);
};
serverSchema.methods.updateNsfw = function (id, cb) {
    this.model('Servers').update({id: this.id}, {$set: {nsfwChannel: id}}, cb);
};
serverSchema.methods.updatePms = function (bool, cb) {
    this.model('Servers').update({id: this.id}, {$set: {pmNotifications: bool}}, cb);
};
serverSchema.methods.updateLevels = function (bool, cb) {
    this.model('Servers').update({id: this.id}, {$set: {levelEnabled: bool}}, cb);
};
serverSchema.methods.updatePrefix = function (prefix, cb) {
    this.model('Servers').update({id: this.id}, {$set: {prefix: prefix}}, cb);
};
serverSchema.methods.updateLanguage = function (lng, cb) {
    this.model('Servers').update({id: this.id}, {$set: {lng: lng}}, cb);
};
serverSchema.methods.updateVolume = function (volume, cb) {
    this.model('Servers').update({id: this.id}, {$set: {volume: volume}}, cb);
};
serverSchema.methods.updateChannel = function (bool, cb) {
    this.model('Servers').update({id: this.id}, {$set: {chNotifications: bool}}, cb);
};
serverSchema.methods.setJoin = function (message, channel, cb) {
    this.model('Servers').update({id: this.id}, {$set: {joinText: message, joinChannel: channel}}, cb);
};
serverSchema.methods.setLeave = function (message, channel, cb) {
    this.model('Servers').update({id: this.id}, {$set: {leaveText: message, leaveChannel: channel}}, cb);
};
serverSchema.methods.addRole = function (role, cb) {
    this.model('Servers').update({id: this.id}, {$addToSet: {roles: role}}, cb);
};
var serverModel = mongoose.model('Servers', serverSchema);
module.exports = serverModel;