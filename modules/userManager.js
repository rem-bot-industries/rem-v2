/**
 * Created by julia on 10.11.2016.
 */
var EventEmitter = require('eventemitter3');
var userModel = require('../DB/user');
class UserManager extends EventEmitter {
    constructor() {
        super();
    }

    createUser(id, cb) {
        let user = new userModel({
            id: id,
            nsfwChannels: [],
            cmdChannels: [],
            lastVoiceChannel: "",
            levelEnabled: true,
            pmNotifications: true,
            chNotifications: false,
            prefix: "!w."
        });
        user.save((err) => {
            if (err) return cb(err);
            cb();
        });
    }

    loadUser(id, cb) {
        userModel.findOne({id: id}, (err, Guild) => {
            if (err) return cb(err);
            if (Guild) {
                return cb(null, Guild);
            } else {
                this.createuser(id, cb);
            }
        });
    }

}
module.exports = UserManager;