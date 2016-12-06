/**
 * Created by julia on 10.11.2016.
 */
let EventEmitter = require('eventemitter3');
let userModel = require('../DB/user');
class UserManager extends EventEmitter {
    constructor() {
        super();
    }

    createUser(user, cb) {
        let User = new userModel({
            id: user.id,
            name: user.username,
            servers: [],
            settings: [],
            marriages: [],
            levelEnabled: true,
            pmNotifications: true,
            avatar: user.avatarURL ? user.avatarURL : user.defaultAvatarURL,
            created: new Date(),
            blacklist: false,
            verified: false,
            credits: 0,
            rep: 0,
            creditCooldown: new Date(),
            reps: []
        });
        User.save((err) => {
            if (err) return cb(err);
            cb(null, User);
        });
    }

    loadUser(user, cb) {
        userModel.findOne({id: user.id}, (err, User) => {
            if (err) return cb(err);
            if (User) {
                cb(null, User);
            } else {
                this.createUser(user, cb);
            }
        });
    }

    love(target, rep, cb) {
        this.loadUser(target, (err, user) => {
            if (err) return cb(err);
            return user.updateRep(rep, cb);
        });
    }

    checkLoveCD(user) {
        for (let i = 0; i < user.reps.length; i++) {
            if (user.reps[i] < Date.now) {
                return true;
            }
        }
        return (user.reps.length === 0 || user.reps.length === 1);
    }

    addLoveCd(user, cb) {
        let reps = [];
        for (let i = 0; i < user.reps.length; i++) {
            if (user.reps[i] < Date.now) {

            } else {
                reps.push(user.reps[i])
            }
        }
        reps.push(Date.now() + 1000 * 60 * 60 * 24);
        userModel.update({id: user.id}, {$set: {reps: reps}}, (err) => {
            if (err) return cb(err);
            cb(null, reps);
        });
    }

}
module.exports = UserManager;