/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let minimist = require('minimist');
let discordReg = /<?(#|@|@&)[0-9]+>/g;
let Selector = require('../../structures/selector');
class AddPermission extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "ap";
        this.cat = "permission";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = minimist(messageSplit);
        this.parseArgs(args, (err, args) => {
            if (err) return msg.channel.createMessage(err);
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
        // console.log(perm);
        this.p.addPermission(msg.guild.id, perm, (err) => {
            if (err) return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            msg.channel.createMessage(`Ok, the ${perm.type} now has the permission \`${perm.cat}.${perm.perm}\` set to ${perm.use}`);
        })
    }

    guild(msg, args) {
        let perm = this.p.createPermission(args.node, "guild", msg.guild.id, args.allow);
        this.addPermission(msg, perm);
    }

    user(msg, args) {
        let user;
        if (discordReg.test(args.u)) {
            user = msg.mentions[0];
            if (user) {
                let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                this.addPermission(msg, perm);
            } else {
                msg.channel.createMessage('NOPE user');
            }
        } else {
            let regex = new RegExp(`${args.u}.*`, 'gi');
            let users = msg.guild.members.filter(u => {
                return regex.test(u.user.username)
            });
            if (users.length > 1) {
                let collector = new Selector(msg, users, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    user = users[number - 1];
                    let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (users.length === 1) {
                    user = users[0];
                    let perm = this.p.createPermission(args.node, "user", user.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(`No user with name ${args.u} found!`);
                }
            }
        }
    }

    role(msg, args) {
        let role;
        if (discordReg.test(args.r)) {
            role = msg.roleMentions[0];
            if (role) {
                let perm = this.p.createPermission(args.node, "role", role, args.allow);
                // msg.channel.createMessage('```json\n' + JSON.stringify(perm) + '```');
            } else {
                msg.channel.createMessage('NOPE Role');
            }
        } else {
            let regex = new RegExp(`${args.r}.*`, 'gi');
            let roles = msg.guild.roles.filter(r => regex.test(r.name));
            if (roles.length > 1) {
                let collector = new Selector(msg, roles, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    role = roles[number - 1];
                    let perm = this.p.createPermission(args.node, "role", role.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (roles.length === 1) {
                    role = roles[0];
                    let perm = this.p.createPermission(args.node, "role", role.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(`No role with name ${args.r} found!`);
                }
            }
        }
    }

    channel(msg, args) {
        let channel;
        if (discordReg.test(args.c)) {
            channel = msg.channelMentions[0];
            if (channel) {
                let perm = this.p.createPermission(args.node, "channel", channel, args.allow);
                this.addPermission(msg, perm);
            } else {
                msg.channel.createMessage('NOPE channel');
            }
        } else {
            let regex = new RegExp(`${args.c}.*`, 'gi');
            let channels = msg.guild.channels.filter(c => {
                return regex.test(c.name) && c.type === 0
            });
            if (channels.length > 1) {
                let collector = new Selector(msg, channels, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    channel = channels[number - 1];
                    let perm = this.p.createPermission(args.node, "channel", channel.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (channels.length === 1) {
                    channel = channels[0];
                    let perm = this.p.createPermission(args.node, "channel", channel.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(`No channel with name ${args.c} found!`);
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