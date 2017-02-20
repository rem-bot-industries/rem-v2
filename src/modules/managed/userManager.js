/**
 * Created by Julian/Wolke on 10.11.2016.
 */
let Manager = require('../../structures/manager');
let userModel = require('../../DB/user');
let Cache;
let userCache;
const winston = require('winston');
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
    winston.debug('Using Redis Cache for Users!');
} else {
    Cache = require('./../../structures/cache');
    userCache = Cache;
    winston.debug('Using Map Cache for Users!');
}
let _ = require('lodash');
class UserManager extends Manager {
    constructor({mod}) {
        super();
        this.version = '1.0.0';
        this.name = 'Usermanager';
        this.shortcode = 'um';
        this.mod = mod;
        this.Raven = mod.getMod('raven');
        if (remConfig.redis_enabled) {
            userCache = new Cache(this.mod.getMod('redis'));
        }
    }

    async createUser(user) {
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
        await User.save();
        return User;
    }

    async loadUser(user) {
        let User;
        try {
            User = await userCache.get(`user_${user.id}`);
            if (User) {
                winston.debug(`Loaded User ${user.id}|${user.username}#${user.discriminator} from Cache!`);
                return User;
            }
        } catch (e) {
            this.Raven.captureException(e);
            console.error(e);
        }
        User = await userModel.findOne({id: user.id});
        if (!User) {
            winston.debug(`Creating User ${user.id}|${user.username}#${user.discriminator} in Database!`);
            User = await this.createUser(user);
        } else {
            winston.debug(`Loading User ${user.id}|${user.username}#${user.discriminator} from Database!`);
        }
        try {
            await userCache.set(`user_${user.id}`, User);
            winston.debug(`Loading User ${user.id}|${user.username}#${user.discriminator} into Cache!`);
        } catch (e) {
            this.Raven.captureException(e);
            console.error(e);
        }
        return User;
        //     if (err) return cb(err);
        //     if (User) {
        //
        //         return Promise.resolve(User);
        //     } else {
        //         return this.createUser(user);
        //     }
        // });
    }

    async love(target, rep) {
        let user = await this.loadUser(target);
        user.rep += rep;
        await userCache.set(`user_${user.id}`, user);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(user);
        }
        return userModel.update({id: user.id}, {$set: {rep: user.rep}});
    }

    checkLoveCD(user) {
        if (!user.reps || user.reps.length === 0 || user.reps.length === 1) {
            return true;
        }
        for (let i = 0; i < user.reps.length; i++) {
            if (user.reps[i] < Date.now()) {
                return true;
            }
        }
        return false;
    }

    async addLoveCd(user) {
        let reps = [];
        for (let i = 0; i < user.reps.length; i++) {
            if (user.reps[i] > Date.now()) {
                reps.push(user.reps[i]);
            }
        }
        reps.push(Date.now() + 1000 * 60 * 60 * 24);
        user.reps = reps;
        await userCache.set(`user_${user.id}`, user);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(user);
        }
        await userModel.update({id: user.id}, {$set: {reps: reps}});
        return Promise.resolve(reps);
    }

    calcLevelXp(level) {
        return Math.floor(level * 2 * 3.14 * 15);
    }

    calcXp(msg) {
        let bonus = Math.floor(msg.content.length / 50);
        bonus = bonus > 10 ? 10 : bonus;
        return 5 + bonus;
    }

    async increaseExperience(msg) {
        let serverData = await this.getServerData(msg.dbUser, msg.channel.guild.id);
        if (serverData.cooldown < Date.now()) {
            serverData.id = serverData.id ? serverData.id : serverData.serverId;
            serverData.xp += this.calcXp(msg);
            serverData.totalXp += this.calcXp(msg);
            serverData.cooldown = Date.now() + 10000;
            if (serverData.xp >= this.calcLevelXp(serverData.level)) {
                serverData.level += 1;
                serverData.xp = 0;
            }
            return this.updateServerData(msg.dbUser, data);
        }
    }

    async addServerData(user, data) {
        user.servers.push(data);
        await userCache.set(`user_${user.id}`, User);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(user);
        }
        return userModel.update({id: user.id}, {$addToSet: {servers: data}});
    }

    async getServerData(user, guildId) {
        let found = false;
        for (let i = 0; i < user.servers.length; i++) {
            if (user.servers[i].serverId === guildId) {
                found = true;
                return Promise.resolve(user.servers[i]);
            }
        }
        let data = {
            id: guildId,
            serverId: guildId,
            pm: true,
            level: 1,
            xp: 5,
            totalXp: 5,
            cooldown: Date.now() + 10000,
            muted: false,
            mutedCd: Date.now(),
            credits: 0,
            inventory: [],
            modCases: []
        };
        return this.addServerData(user, data);
    }

    async updateServerData(user, data) {
        let i = _.findIndex(user.servers, (s) => {
            return s.id === data.id;
        });
        user.servers[i] = data;
        await userCache.set(`user_${user.id}`, user);
        if (!remConfig.redis_enabled) {
            this.sendCacheUpdate(user);
        }
        return userModel.update({id: user.id, 'servers.serverId': data.serverId}, {
            $set: {
                'servers.$.cooldown': data.cooldown,
                'servers.$.xp': data.xp,
                'servers.$.totalXp': data.totalXp
            }
        });
    }

    sendCacheUpdate(data) {
        this.emit('_cache_update', {type: 'user', data});
    }

    updateCache(data) {
        if (userCache.get(data.id)) {
            userCache.set(data.id, data);
        }
    }
}
module.exports = {class: UserManager, deps: [], async: false, shortcode: 'um'};