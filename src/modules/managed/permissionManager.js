/**
 * Created by Julian/Wolke on 13.11.2016.
 */
let permModel = require('../../DB/permission');
let winston = require('winston');
let async = require('async');
let config = remConfig;
let util = require('util');
const defaultPerms = [
    {type: 'guild', id: '228604101800230912', cat: 'fun', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'eastereggs', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'generic', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'misc', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'image', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'music', perm: '*', use: true},
    {type: 'guild', id: '228604101800230912', cat: 'music', perm: 'fskip', use: false}
];
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
     */
    async checkPermission(msg, node) {
        this.msg = msg;
        this.guild = msg.channel.guild;
        this.node = node;
        let nodeSplit = node.split('.');
        this.cat = nodeSplit[0];
        this.cmd = nodeSplit[1];
        if (msg.channel.guild) {
            if (this.checkDiscordRoles(msg)) {
                return;
            }
            let res = await this.loadPermission(msg);
            console.log(res);
            if (!res) {
                throw new Error('Missing Permissions');
            }

        }
    }

    /**
     * Loads the permission document out of the database
     * @param msg - the message, so we can get the id of the guild to load the perms per guild
     */
    async loadPermission(msg) {
        let Perms = await permModel.findOne({id: msg.channel.guild.id});
        if (Perms) {
            return this.buildPermTree(Perms.permissions);
        } else {
            return this.buildPermTree(defaultPerms);
        }
    }

    /**
     * Build the json object known as the mighty permission tree,
     * JK it builds a big json object with all the perms combined,
     * that makes it easier to evaluate the perms
     * @param Perms
     */
    buildPermTree(Perms) {
        let tree = {channel: {}, user: {}, role: {}};
        // console.log(Perms);
        Perms.forEach(Perm => {
            switch (Perm.type) {
                case 'guild':
                    if (!tree[Perm.cat]) {
                        tree[Perm.cat] = {};
                    }
                    if (typeof (tree[Perm.cat][Perm.perm]) === 'undefined') {
                        tree[Perm.cat][Perm.perm] = Perm.use;
                    }
                    if (tree[Perm.cat][Perm.perm]) {
                        tree[Perm.cat][Perm.perm] = Perm.use;
                    }
                    break;
                case 'channel':
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
                    break;
                case 'role':
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
                    break;
                case 'user':
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
                    break;
            }
        });
        return this.checkTree(tree);
    }

    checkTree(tree) {
        // console.log(tree);
        let finalPerms = {user: true, role: true, channel: true, guild: true};
        finalPerms.user = this.uwu(tree.user);
        finalPerms.role = this.uwu(tree.role);
        finalPerms.channel = this.uwu(tree.channel);
        finalPerms.guild = this.uwu(tree);
        // console.log(finalPerms);
        return this.owo(finalPerms);
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
        // console.log(tree);
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
        if (msg.author.id === msg.channel.guild.ownerID) {
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

    async addPermission(id, perm, addDefaults) {
        let Perms = await permModel.findOne({id: id});
        if (Perms) {
            if (Perms.permissions.length > 0) {
                if (this.checkExist(perm, Perms.permissions)) {
                    await permModel.update({id}, {
                        $pull: {
                            permissions: {
                                id: perm.id,
                                cat: perm.cat,
                                perm: perm.perm
                            }
                        }
                    });
                    return permModel.update({id}, {$push: {permissions: perm}});
                } else {
                    return permModel.update({id: id}, {$push: {permissions: perm}});
                }
            } else {
                if (typeof (addDefaults) === 'undefined') {
                    throw new Error('add_defaults');
                }
                if (addDefaults) {
                    let defaults = defaultPerms;
                    defaults.push(perm);
                    return permModel.update({id: id}, {$push: {permissions: {$each: defaults}}});
                } else {
                    return permModel.update({id: id}, {$push: {permissions: perm}});
                }
            }
        } else {
            if (typeof (addDefaults) === 'undefined') {
                throw new Error('add_defaults');
            }
            return this.createDbPerm(id, perm, addDefaults);
        }
    }

    async removePermission(id, perm) {
        let Perms = await permModel.findOne({id: id});
        if (Perms) {
            if (Perms.permissions.length > 0) {
                let perms = Perms.permissions.filter(p => {
                    if (perm.cat !== p.cat) {
                        return true;
                    }
                    if (perm.perm !== p.perm) {
                        return true;
                    }
                    if (perm.id !== p.id) {
                        return true;
                    }
                    if (perm.type !== p.type) {
                        return true;
                    }
                });
                console.log(perms);
                return permModel.update({id: id}, {$set: {permissions: perms}});
            } else {
                throw new TranslatableError({t: 'no-perms', message: 'No permissions found'});
            }
        } else {
            throw new TranslatableError({t: 'no-perms', message: 'No permissions found'});
        }
    }

    async resetDbPerm(id) {
        let Perms = await permModel.findOne({id});
        if (Perms) {
            return permModel.remove({id});
        } else {
            throw new TranslatableError({
                t: 'reset-perms.nothing-found',
                message: 'No permission object created on the database'
            });
        }
    }

    async createDbPerm(id, perm, addDefaults) {
        let permsToBeAdded = [perm];
        if (addDefaults) {
            defaultPerms.forEach(p => permsToBeAdded.push(p));
        }
        let perms = new permModel({
            id: id,
            permissions: permsToBeAdded
        });
        return perms.save();
    }

    checkExist(perm, perms) {
        for (let i = 0; i < perms.length; i++) {
            if (perm.id === perms[i].id && perm.type === perms[i].type && perm.cat === perms[i].cat && perm.perm === perms[i].perm) {
                return true;
            }
        }
        return false;
    }

    async getPermDB(msg) {
        let Perms = await permModel.findOne({id: msg.channel.guild.id});
        if (Perms && Perms.permissions.length > 0) {
            return Perms.permissions;
        } else {
            throw new TranslatableError({t: 'gp.no-perms', message: 'No permissions created yet'});
        }
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
        if (msg.member) {
            let roles = msg.member.roles;
            for (let i = 0; i < roles.length; i++) {
                if (id === roles[i]) {
                    return roles[i];
                }
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
        if (!member) {
            member = msg.channel.guild.members.find((m) => {
                return m.id === msg.author.id
            });
        }
        let guild = msg.channel.guild;
        let roles = [];
        if (member) {
            member.roles.forEach((mRole) => {
                let role = guild.roles.find((r) => {
                    return r.id === mRole;
                });
                if (role) {
                    roles.push(role);
                }
            });
        }
        return roles;
    }

    getDefaultPerms() {
        return defaultPerms;
    }

}
module.exports = {class: PermissionManager, deps: [], async: false, shortcode: 'pm'};