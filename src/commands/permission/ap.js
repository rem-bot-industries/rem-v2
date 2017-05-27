/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
const regs = {user: /<?(?:@|@!)([0-9]+)>/, channel: /<?(?:#)([0-9]+)>/, role: /<?(?:@&)([0-9]+)>/};
let Selector = require('../../structures/selector');
let argParser = require('../../structures/argumentParser');
const utils = require('../../structures/utilities');
const searcher = require('../../structures/searcher');
class AddPermission extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'ap';
        this.cat = 'permission';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.p = mod.getMod('pm');
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = argParser(messageSplit);
        this.parseArgs(args, msg, (err, args) => {
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
        this.p.addPermission(msg.channel.guild.id, perm, (err) => {
            if (err) return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            let type = this.t(`ap.type.${perm.type}`);
            let name = 'UNRESOLVED';
            switch (perm.type) {
                case 'guild': {
                    name = msg.channel.guild.name;
                    break;
                }
                case 'channel': {
                    let channel = msg.channel.guild.channels.find(c => c.id === perm.id);
                    if (channel) {
                        name = channel.name;
                    }
                    break;
                }
                case 'user': {
                    let member = msg.channel.guild.members.find(u => u.id === perm.id);
                    if (member) {
                        let user = member.user;
                        name = `${user.username}#${user.discriminator}`;
                    }
                    break;
                }
                case 'role': {
                    let role = msg.channel.guild.roles.find(r => r.id === perm.id);
                    if (role) {
                        name = role.name;
                    }
                    break;
                }
            }
            msg.channel.createMessage(this.t('ap.success', {
                lngs: msg.lang,
                node: `${perm.cat}.${perm.perm}`,
                allowed: perm.use,
                type,
                name
            }));
        });
    }

    guild(msg, args) {
        let perm = this.p.createPermission(args.node, 'guild', msg.channel.guild.id, args.allow);
        this.addPermission(msg, perm);
    }

    async user(msg, args) {
        let user;
        if (regs.user.test(args.u)) {
            user = msg.mentions[0];
            if (user) {
                let perm = this.p.createPermission(args.node, 'user', user.id, args.allow);
                this.addPermission(msg, perm);
            } else {
                return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.u}));
            }
        } else {
            let users = utils.searchUser(msg.channel.guild.members, args.u);
            let pick = await searcher.userSearchMenu(msg, [args.u], this.t);
            if (users.length > 1) {
                let collector = new Selector(msg, users, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    user = users[number - 1];
                    let perm = this.p.createPermission(args.node, 'user', user.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (users.length === 1) {
                    user = users[0];
                    let perm = this.p.createPermission(args.node, 'user', user.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.u}));
                }
            }
        }
    }

    role(msg, args) {
        let role;
        if (discordReg.test(args.r)) {
            role = msg.roleMentions[0];
            if (role) {
                let perm = this.p.createPermission(args.node, 'role', role, args.allow);
                this.addPermission(msg, perm);
            } else {
                return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.r}));
            }
        } else {
            let regex = new RegExp(`${args.r}.*`, 'gi');
            let roles = msg.channel.guild.roles.filter(r => regex.test(r.name));
            if (roles.length > 1) {
                let collector = new Selector(msg, roles, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    role = roles[number - 1];
                    let perm = this.p.createPermission(args.node, 'role', role.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (roles.length === 1) {
                    role = roles[0];
                    let perm = this.p.createPermission(args.node, 'role', role.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.r}));
                }
            }
        }
    }

    channel(msg, args) {
        let channel;
        if (discordReg.test(args.c)) {
            channel = msg.channelMentions[0];
            if (channel) {
                let perm = this.p.createPermission(args.node, 'channel', channel, args.allow);
                this.addPermission(msg, perm);
            } else {
                return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.c}));
            }
        } else {
            let regex = new RegExp(`${args.c}.*`, 'gi');
            let channels = msg.channel.guild.channels.filter(c => {
                return regex.test(c.name) && c.type === 0;
            });
            if (channels.length > 1) {
                let collector = new Selector(msg, channels, this.t, (err, number) => {
                    if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    channel = channels[number - 1];
                    let perm = this.p.createPermission(args.node, 'channel', channel.id, args.allow);
                    this.addPermission(msg, perm);
                });
            } else {
                if (channels.length === 1) {
                    channel = channels[0];
                    let perm = this.p.createPermission(args.node, 'channel', channel.id, args.allow);
                    this.addPermission(msg, perm);
                } else {
                    return msg.channel.createMessage(this.t('ap.target-not-found', {lngs: msg.lang, target: args.c}));
                }
            }
        }
    }

    parseArgs(args, msg, cb) {
        let node;
        if (args._.length > 0) {
            let nodeSplit = args._[0].split('.');
            if (nodeSplit.length === 2) {
                if (nodeSplit[0] === '*') {
                    node = '*.*';
                } else {
                    node = nodeSplit.join('.');
                    if (nodeSplit[1] !== '*') {
                        let cmd = msg.cmds[nodeSplit[1]];
                        if (!cmd) {
                            cmd = {cmd: 'cleverbot', cat: 'fun'};
                        }
                        if (cmd || nodeSplit[1] === 'cleverbot') {
                            if ((nodeSplit[0] === cmd.cat && nodeSplit[1] === cmd.cmd) || node === 'fun.cleverbot') {

                            } else {
                                return cb(this.t('ap.wrong-node', {lngs: msg.lang, prefix: msg.prefix, node}));
                            }
                        } else {
                            return cb(this.t('ap.wrong-node', {lngs: msg.lang, prefix: msg.prefix, node}));
                        }
                    }
                }
            } else if (nodeSplit.length === 1) {
                if (nodeSplit[0] === '*') {
                    node = '*.*';
                } else {
                    node = nodeSplit.join('.');
                    return cb(this.t('ap.wrong-node', {lngs: msg.lang, prefix: msg.prefix, node}));
                }
            } else {
                return cb(this.t('ap.wrong-node', {lngs: msg.lang, prefix: msg.prefix, node: '-'}));
            }
            args.node = node;
            if (args._.length > 1) {
                if (typeof(args._[1]) === 'string') {
                    args.allow = args._[1] === 'true';
                    cb(null, args);
                }
            } else {
                return cb(this.t('ap.no-allowance-set', {lngs: msg.lang}));
            }
        } else {
            return cb(this.t('ap.missing-args', {lngs: msg.lang, prefix: msg.prefix, node: '-'}));
        }
    }
}
module.exports = AddPermission;