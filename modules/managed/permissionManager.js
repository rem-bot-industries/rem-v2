/**
 * Created by julia on 13.11.2016.
 */
let Manager = require('../../structures/manager');
let permModel = require('../../DB/permission');
let winston = require('winston');
let async = require("async");
let config = require('../../config/main.json');
let util = require("util");
let _ = require('lodash');
/**
 * The permission manager, it loads all permissions from the database and builds the permission tree
 */
class PermissionManager {
    /**
     * Initalize the instance variables in the constructor
     */
    constructor() {
        this.msg = null;
        this.guild = null;
        this.node = null;
        this.cat = null;
        this.cmd = null;
    }

    /**
     * The base function to check if a user is allowed to do sth.
     * @param msg - The msg of the command that should be check
     * @param node - the permission node category.command
     * @param cb - the callback
     */
    checkPermission(msg, node, cb) {
        this.msg = msg;
        this.guild = msg.guild;
        this.node = node;
        let nodeSplit = node.split('.');
        this.cat = nodeSplit[0];
        this.cmd = nodeSplit[1];
        if (msg.guild) {
            if (this.checkDiscordRoles(msg)) {
                return cb();
            }
            this.loadPermission(msg, (err) => {
                cb(err);
            });
        } else {
            cb();
        }

    }

    /**
     * Loads the permission document out of the database
     * @param msg - the message, so we can get the id of the guild to load the perms per guild
     * @param cb - the callback
     */
    loadPermission(msg, cb) {
        permModel.findOne({id: msg.guild.id}, (err, Perms) => {
            if (err) return cb(err);
            if (Perms) {
                this.buildPermTree(Perms.permissions, cb);
            } else {
                Perms = [
                    {type: 'guild', id: '228604101800230912', cat: 'fun', perm: '*', use: true},
                    {type: 'guild', id: '228604101800230912', cat: 'eastereggs', perm: '*', use: true},
                    {type: 'guild', id: '228604101800230912', cat: 'generic', perm: '*', use: true},
                    {type: 'guild', id: '228604101800230912', cat: 'misc', perm: '*', use: true},
                    {type: 'guild', id: '228604101800230912', cat: 'music', perm: '*', use: true},
                    {type: 'guild', id: '228604101800230912', cat: 'music', perm: 'fskip', use: false},
                ];
                this.buildPermTree(Perms, cb);
            }
        })
    }

    /**
     * Build the json object known as the mighty permission tree,
     * JK it builds a big json object with all the perms combined,
     * that makes it easier to evaluate the perms
     * @param Perms
     * @param cb
     */
    buildPermTree(Perms, cb) {
        let tree = {channel: {}, user: {}, role: {}};
        async.each(Perms, (Perm, cb) => {
            switch (Perm.type) {
                case "guild":
                    if (!tree[Perm.cat]) {
                        tree[Perm.cat] = {};
                    }
                    if (typeof (tree[Perm.cat][Perm.perm]) === 'undefined') {
                        tree[Perm.cat][Perm.perm] = Perm.use;
                    }
                    if (tree[Perm.cat][Perm.perm]) {
                        tree[Perm.cat][Perm.perm] = Perm.use;
                    }
                    async.setImmediate(() => {
                        cb();
                    });
                    return;
                case "channel":
                    if (Perm.id === this.msg.channel.id) {
                        if (!tree.channel[Perm.cat]) {
                            tree.channel[Perm.cat] = {};
                        }
                        if (typeof (tree.channel[Perm.cat][Perm.perm]) === 'undefined') {
                            tree.channel[Perm.cat][Perm.perm] = Perm.use;
                        }
                        if (tree.channel[Perm.cat][Perm.perm]) {
                            tree.channel[Perm.cat][Perm.perm] = Perm.use;
                        }
                    }
                    async.setImmediate(() => {
                        cb();
                    });
                    return;
                case "role":
                    if (this.checkRoleExistId(this.msg, Perm.id)) {
                        if (!tree.role[Perm.cat]) {
                            tree.role[Perm.cat] = {};
                        }
                        if (typeof (tree.role[Perm.cat][Perm.perm]) === 'undefined') {
                            tree.role[Perm.cat][Perm.perm] = Perm.use;
                        }
                        if (tree.role[Perm.cat][Perm.perm]) {
                            tree.role[Perm.cat][Perm.perm] = Perm.use;
                        }
                    }
                    async.setImmediate(() => {
                        cb();
                    });
                    return;
                case "user":
                    if (this.msg.author.id === Perm.id) {
                        if (!tree.user[Perm.cat]) {
                            tree.user[Perm.cat] = {};
                        }
                        if (typeof (tree.user[Perm.cat][Perm.perm]) === 'undefined') {
                            tree.user[Perm.cat][Perm.perm] = Perm.use;
                        }
                        if (tree.user[Perm.cat][Perm.perm]) {
                            tree.user[Perm.cat][Perm.perm] = Perm.use;
                        }
                    }
                    async.setImmediate(() => {
                        cb();
                    });
                    return;
            }
        }, (err) => {
            this.checkTree(tree, cb);
        });
    }

    checkTree(tree, cb) {
        let finalPerms = {user: true, role: true, channel: true, guild: true};
        finalPerms.user = this.uwu(tree.user);
        finalPerms.role = this.uwu(tree.role);
        finalPerms.channel = this.uwu(tree.channel);
        finalPerms.guild = this.uwu(tree);
        let res = this.owo(finalPerms);
        if (res) {
            return cb();
        } else {
            return cb('NOPE');
        }
    }

    owo(finalPerms) {
        if (finalPerms.user === true) {
            return true;
        }
        if (finalPerms.user === false) {
            return false;
        }
        if (finalPerms.user === '-') {
            if (finalPerms.role === true) {
                return true;
            }
            if (finalPerms.role === false) {
                return false;
            }
            if (finalPerms.role === '-') {
                if (finalPerms.channel === true) {
                    return true;
                }
                if (finalPerms.channel === false) {
                    return false;
                }
                if (finalPerms.channel === '-') {
                    if (finalPerms.guild === true) {
                        return true;
                    }
                    if (finalPerms.guild === false) {
                        return false;
                    }
                    if (finalPerms.guild === '-') {
                        return false;
                    }
                }
            }
        }
    }

    uwu(tree) {
        // this.msg.channel.sendCode('json', JSON.stringify(tree));
        if (tree[this.cat] || tree['*']) {
            if (tree[this.cat]) {
                if (tree[this.cat].hasOwnProperty(this.cmd) || tree[this.cat].hasOwnProperty('*')) {
                    if (tree[this.cat].hasOwnProperty(this.cmd)) {
                        return tree[this.cat][this.cmd];
                    } else {
                        return tree[this.cat]['*'];
                    }
                } else {
                    if (tree['*']) {
                        if (tree['*'].hasOwnProperty('*')) {
                            return tree['*']['*'];
                        }
                    } else {
                        return '-';
                    }
                }
            } else {
                if (!tree['*']['*']) {
                    return false;
                }
            }
            return true;
        } else {
            return '-';
        }
    }

    checkDiscordRoles(msg) {
        if (msg.author.id === config.owner_id) {
            return true;
        }
        if (this.checkRoleExistName(msg, 'WolkeBot')) {
            return true;
        }
        if (msg.author.id === msg.guild.ownerID) {
            return true;
        }
        return (this.checkRolePerm(msg, 'administrator'));
    }

    createPermission(node, type, id, allow) {
        let nodeSplit = node.split('.');
        if (typeof(allow) === 'string') {
            allow = allow === 'true';
        }
        return ({type: type, id: id, cat: nodeSplit[0], perm: nodeSplit[1], use: allow});
    }

    addPermission(id, perm, cb) {
        permModel.findOne({id: id}, (err, Perms) => {
            if (err) return cb(err);
            if (Perms) {
                if (Perms.permissions.length > 0) {
                    if (this.checkExist(perm, Perms.permissions)) {
                        //TODO ask the user if he wants to overwrite the permission
                    } else {
                        permModel.update({id: id}, {$push: {permissions: perm}}, cb);
                    }
                } else {
                    permModel.update({id: id}, {$push: {permissions: perm}}, cb);
                }
            } else {
                this.createDbPerm(id, perm, cb);
            }
        });
    }

    removePermission(id, perm, cb) {
        permModel.findOne({id: id}, (err, Perms) => {
            if (err) {
                winston.error(err);
                return cb('generic.error');
            }
            if (Perms) {
                if (Perms.permissions.length > 0) {
                    let perms = _.reject(Perms.permissions, perm);
                    // console.log(perms);
                    permModel.update({id: id}, {$set: {permissions: perms}}, cb);
                } else {
                    return cb('no-perms');
                }
            } else {
                return cb('no-perms');
            }
        });
    }

    createDbPerm(id, perm, cb) {
        let perms = new permModel({
            id: id,
            permissions: [perm]
        });
        perms.save(cb);
    }

    checkExist(perm, perms) {
        for (let i = 0; i < perms.length; i++) {
            if (perm === perms[i]) {
                return perm;
            }
        }
        return false;
    }

    getPermDB(msg, cb) {
        permModel.findOne({id: msg.guild.id}, (err, Perms) => {
            if (err) return cb(err);
            if (Perms && Perms.permissions.length > 0) {
                cb(null, Perms.permissions);
            } else {
                cb('no-perms');
            }
        })
    }

    checkRoleExistName(msg, name) {
        let roles = this.loadUserRoles(msg);
        for (let i = 0; i < roles.length; i++) {
            if (name === roles[i].name) {
                return roles[i];
            }
        }
        return false;
    }

    checkRoleExistId(msg, id) {
        let roles = msg.member.roles;
        for (let i = 0; i < roles.length; i++) {
            if (id === roles[i]) {
                return roles[i];
            }
        }
        return false;
    }

    checkRolePerm(msg, perm) {
        let roles = this.loadUserRoles(msg);
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].permissions.has(perm)) {
                return roles[i];
            }
        }
        return false;
    }

    loadUserRoles(msg) {
        let member = msg.member;
        let guild = msg.guild;
        let roles = [];
        member.roles.forEach((mRole) => {
            let role = guild.roles.find((r) => {
                return r.id === mRole;
            });
            if (role) {
                roles.push(role);
            }
        });
        return roles;
    }

}
module.exports = {class: PermissionManager, deps: [], async: false, shortcode: 'pm'};