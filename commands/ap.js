/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
var PermManager = require('../modules/permissionManager');
var minimist = require('minimist');
var discordReg = /<?(#|@|@&)[0-9]+>/g;
var Selector = require('../modules/selector');
class AddPermission extends Command {
    constructor(t) {
        super();
        this.cmd = "ap";
        this.cat = "permission";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.p = new PermManager();
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let node;
        let args = minimist(messageSplit);
        let allow = false;
        this.parseArgs(args, (err, args) => {
            if (err) return msg.channel.sendMessage(err);
            console.log(args);
            msg.channel.sendCode('JSON', JSON.stringify(args));
            if (args.r) {
                return this.role(msg, args);
            }
            if (args.c) {
                return this.channel(msg, args);
            }
            if (args.u) {
                return this.user(msg, args);
            }
            this.guild(msg, args);
        });
    }

    addPermission(msg, perm) {
        console.log(perm);
        this.p.addPermission(msg.guild.id, perm, (err) => {
            if (err) return msg.channel.sendMessage(this.t('generic.error', {lngs: msg.lang}));
            msg.channel.sendMessage(`Ok, the ${perm.type} now has the permission \`${perm.cat}.${perm.perm}\`set to ${perm.use}`);
        })
    }

    guild(msg, args) {
        let perm = this.p.createPermission(args.node, "guild", msg.guild.id, args.allow);
        this.addPermission(msg, perm);
    }

    user(msg, args) {
        let user;
        if (discordReg.test(args.u)) {
            user = msg.mentions.users.first();
            if (user) {
                let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                this.addPermission(msg, perm);
            } else {
                msg.channel.sendMessage('NOPE user');
            }
        } else {
            let regex = new RegExp(`${args.u}.*`, 'gi');
            let users = msg.guild.members.filter(u => {
                return regex.test(u.user.username)
            });
            if (users.size > 1) {
                users = users.array();
                let collector = new Selector(msg, users, (err, number) => {
                    if (err) return msg.channel.sendMessage(err);
                    user = users[number - 1];
                    let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (users.size === 1) {
                    user = users.first();
                    let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.sendMessage(`No user with name ${args.u} found!`);
                }
            }
        }
    }

    role(msg, args) {
        let role;
        if (discordReg.test(args.r)) {
            role = msg.mentions.roles.first();
            if (role) {
                let perm = this.p.createPermission(args.node, "role", role.id, args.allow);
                msg.channel.sendCode('json', JSON.stringify(perm));
            } else {
                msg.channel.sendMessage('NOPE Role');
            }
        } else {
            let regex = new RegExp(`${args.r}.*`, 'gi');
            let roles = msg.guild.roles.filter(r => regex.test(r.name));
            if (roles.size > 1) {
                roles = roles.array();
                let collector = new Selector(msg, roles, (err, number) => {
                    if (err) return msg.channel.sendMessage(err);
                    role = roles[number - 1];
                    let perm = this.p.createPermission(args.node, "role", role.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (roles.size === 1) {
                    role = roles.first();
                    let perm = this.p.createPermission(args.node, "role", role.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.sendMessage(`No role with name ${args.r} found!`);
                }
            }
        }
    }

    channel(msg, args) {
        let channel;
        if (discordReg.test(args.c)) {
            channel = msg.mentions.channels.first();
            if (channel) {
                let perm = this.p.createPermission(args.node, "channel", channel.id, args.allow);
                this.addPermission(msg, perm);
            } else {
                msg.channel.sendMessage('NOPE channel');
            }
        } else {
            let regex = new RegExp(`${args.c}.*`, 'gi');
            let channels = msg.guild.channels.filter(c => {
                return regex.test(c.name)
            });
            if (channels.size > 1) {
                channels = channels.array();
                let collector = new Selector(msg, channels, (err, number) => {
                    if (err) return msg.channel.sendMessage(err);
                    channel = channels[number - 1];
                    let perm = this.p.createPermission(args.node, "channel", channel.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (channels.size === 1) {
                    channel = channels.first();
                    let perm = this.p.createPermission(args.node, "channel", channel.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.sendMessage(`No channel with name ${args.c} found!`);
                }
            }
        }
    }

    parseArgs(args, cb) {
        let node;
        if (args._.length > 0) {
            let nodeSplit = args._[0].split('.');
            console.log(nodeSplit);
            if (nodeSplit.length === 2) {
                if (nodeSplit[0] === '*') {
                    node = '*.*';
                } else {
                    node = nodeSplit.join('.');
                }
            } else if (nodeSplit.length === 1) {
                if (nodeSplit[0] === '*') {
                    node = '*.*';
                } else {
                    return cb(`RIP \`\`\`${JSON.stringify(nodeSplit)}\`\`\``)
                }
            } else {
                return cb('Node Split is too long or not defined!');
            }
            args.node = node;
            if (args._.length > 1) {
                if (typeof(args._[1]) === 'string') {
                    args.allow = args._[1] === 'true';
                    cb(null, args);
                }
            } else {
                return cb(`That will not work\`\`\`${JSON.stringify(args)}\`\`\``);
            }
        } else {
            return cb(`That will not work\`\`\`${JSON.stringify(args)}\`\`\``);
        }
    }
}
module.exports = AddPermission;