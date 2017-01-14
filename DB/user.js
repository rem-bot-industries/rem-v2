/**
 * Created by julia on 23.07.2016.
 */
let mongoose = require('mongoose');
let userSchema = mongoose.Schema({
    id: String,
    name: String,
    servers: [],
    settings: [],
    marriages: [],
    levelEnabled: {type: Boolean, default: true},
    pmNotifications: {type: Boolean, default: true},
    avatar: String,
    created: {type: Date, default: new Date(0)},
    blacklist: {type: Boolean, default: false},
    verified: {type: Boolean, default: false},
    proxerId: {type: String, default: ''},
    verificationToken: {type: String, default: ''},
    credits: {type: Number, default: 0},
    rep: {type: Number, default: 0},
    creditCooldown: {type: Date, default: new Date(0)},
    reps: [],
    accesslevel: {type: Number, default: 0}

});
// userSchema.methods.updateXP = function updateXP(id,xp,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$inc: {'servers.$.xp': xp,'servers.$.totalXp': xp}, $set:{'servers.$.cooldown':Date.now()}}, cb);
// };
userSchema.methods.updateRep = function updateXP(rep, cb) {
    this.model('Users').update({id: this.id}, {$inc: {rep: rep}}, cb);
};
// userSchema.methods.updateLevel = function updateLevel(id,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$set: {'servers.$.xp': 0}, $inc:{'servers.$.level':1}}, cb);
// };
// userSchema.methods.updateFavorites = function updateFavorites(id,cb) {
//     this.model('Users').update({id:this.id}, {favorites:{$addToSet:id}}, cb);
// };
// userSchema.methods.updateName = function updateName(name,cb) {
//     this.model('Users').update({id:this.id}, {$set:{name:name}}, cb);
// };
// userSchema.methods.disableLevel = function disableLevel(id,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$set: {'servers.$.levelEnabled':false}}, cb);
// };
// userSchema.methods.enableLevel = function enableLevel(id,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$set: {'servers.$.levelEnabled':true}}, cb);
// };
// userSchema.methods.disablePm = function disablePm(id,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$set: {'servers.$.pmNotifications':false}}, cb);
// };
// userSchema.methods.enablePm = function enablePm(id,cb) {
//     this.model('Users').update({id:this.id, 'servers.serverId':id}, {$set: {'servers.$.pmNotifications':true}}, cb);
// };
// userSchema.methods.addServer = function addServer(server,cb) {
//     this.model('Users').update({id:this.id}, {$addToSet:{servers:server}}, cb);
// };
let userModel = mongoose.model('Users', userSchema);
module.exports = userModel;