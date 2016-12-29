/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
const winston = require('winston');
const recursive = require('recursive-readdir');
let path = require("path");
let GuildManager = require('./guildManager');
let UserManager = require('./userManager');
let PermManager = require('./permissionManager');
let ReactionManager = require('./reactionManager');
let CleverBotManager = require('./cleverbot');
let StatManager = require('./statManager');
let async = require('async');
let StatsD = require('node-dogstatsd').StatsD;
let dogstatsd = new StatsD();
class CmdManager extends EventEmitter {
    constructor(l, v) {
        super();
        this.setMaxListeners(20);
        this.l = l;
        this.v = v;
        this.l.on('ready', (t) => {
            this.load(t, this.v);
            this.lngs = this.l.list;
        });
        this.t = null;
        this.g = new GuildManager();
        this.p = new PermManager();
        this.c = new CleverBotManager();
        this.s = new StatManager();
        this.u = new UserManager();
        this.r = new ReactionManager();
        this.commands = {};
        this.ready = false;
    }

    load(t, v) {
        this.t = t;
        recursive(path.join(__dirname, '../commands'), (err, files) => {
            let commands = {};
            for (let file of files) {
                if (file.endsWith('.js')) {
                    let command = require(file);
                    let cmd = new command(t, v);
                    commands[cmd.cmd] = cmd;
                }
            }
            this.commands = commands;
            this.emit('ready', commands);
            this.ready = true;
        });
    }

    reload() {

    }

    unload() {

    }

    check(msg) {
        if (this.ready) {
            this.loadData(msg, (err, Data) => {
                if (err) return winston.error(err);
                let Guild = Data.guild;
                let User = Data.user;
                msg.db = Guild;
                msg.dbUser = User;
                msg.cmds = this.commands;
                if (msg.content.startsWith(Guild.prefix)) {
                    try {
                        let cmd = msg.content.substr(Guild.prefix.length).split(' ')[0];
                        let command = this.commands[cmd];
                        if (command !== undefined) {
                            dogstatsd.increment('musicbot.commands');
                            msg.lang = [Guild.lng, 'en'];
                            msg.lngs = this.lngs;
                            msg.prefix = Guild.prefix;
                            let node = `${command.cat}.${command.cmd}`;
                            this.p.checkPermission(msg, node, (err) => {
                                if (err) {
                                    this.s.logCmdStat(msg, cmd, false, 'permission');
                                    return msg.channel.createMessage(this.t('generic.no-permission', {
                                        lngs: msg.lang,
                                        node: node
                                    }));
                                }
                                console.log(cmd);
                                if (command.needGuild) {
                                    if (msg.guild) {
                                        this.s.logCmdStat(msg, cmd, true);
                                        command.run(msg);
                                    } else {
                                        this.s.logCmdStat(msg, cmd, false, 'need-guild');
                                        return msg.channel.createMessage(this.t('generic.no-pm', {lngs: msg.lang}))
                                    }
                                } else {
                                    this.s.logCmdStat(msg, cmd, true);
                                    command.run(msg);
                                }
                            });
                        }
                    }
                    catch (err) {
                        winston.error(err.message);
                        winston.error(err.stack);
                    }
                } else {
                    if (msg.guild && (msg.content.startsWith(rem.user.mention) || msg.content.startsWith(`<@!${rem.user.id}>`))) {
                        if (msg.content === `${rem.user.mention} prefix` || msg.content === `<@!${rem.user.id}> prefix`) {
                            return msg.channel.createMessage(`\`${msg.db.prefix}\``);
                        }
                        this.p.checkPermission(msg, 'fun.cleverbot', (err) => {
                            if (err) {
                                this.s.logCmdStat(msg, 'cleverbot', false, 'permission');
                                return msg.channel.createMessage(this.t('generic.no-permission', {
                                    lngs: msg.lang,
                                    node: 'fun.cleverbot'
                                }));
                            }
                            this.s.logCmdStat(msg, 'cleverbot', true);
                            this.c.talk(msg);
                        });
                    } else if (msg.guild) {
                        // this.r.filterReaction(msg);
                        // this.u.increaseExperience(msg).then(() => {
                        //
                        // }).catch(err => winston.error);
                    }
                }
            });
        }
    }

    loadData(msg, cb) {
        async.parallel({
            guild: (cb) => {
                this.loadGuild(msg, cb);
            },
            user: (cb) => {
                this.loadUser(msg, cb);
            }
        }, (err, results) => {
            if (err) return cb(err);
            cb(null, results);
        });
    }

    loadGuild(msg, cb) {
        if (msg.guild) {
            this.g.loadGuild(msg.guild.id, (err, Guild) => {
                if (err) return cb(err);
                if (typeof (Guild) === 'undefined') {
                    Guild = {};
                }
                if (typeof (Guild.lng) === 'undefined') {
                    Guild.lng = 'en';
                }
                if (typeof (Guild.prefix) === 'undefined') {
                    Guild.prefix = '!w.';
                }
                cb(null, Guild);
            })
        } else {
            let Guild = {prefix: '!w.', lng: 'en'};
            cb(null, Guild);
        }
    }

    loadUser(msg, cb) {
        this.u.loadUser(msg.author, cb);
    }
}
module.exports = CmdManager;