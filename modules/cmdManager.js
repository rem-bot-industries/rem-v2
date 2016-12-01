/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
const winston = require('winston');
const recursive = require('recursive-readdir');
let path = require("path");
let util = require("util");
let GuildManager = require('./guildManager');
let PermManager = require('./permissionManager');
let CleverBotManager = require('./cleverbot');
let StatManager = require('./statManager');
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
        if (this.ready && !msg.author.bot) {
            this.loadGuild(msg, (err, Guild) => {
                if (err) return winston.error(err);
                msg.db = Guild;
                if (msg.content.startsWith(Guild.prefix)) {
                    try {
                        let cmd = msg.content.substr(Guild.prefix.length).split(' ')[0];
                        let command = this.commands[cmd];
                        if(command !== undefined) {
                            msg.lang = [Guild.lng, 'en'];
                            msg.lngs = this.lngs;
                            msg.cmds = this.commands;
                            msg.prefix = Guild.prefix;
                            let node = `${command.cat}.${command.cmd}`;
                            this.p.checkPermission(msg, node, (err) => {
                                if (err) {
                                    this.s.logCmdStat(msg, cmd, false, 'permission');
                                    return msg.channel.createMessage(`No permission to use \`${node}\``);
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
                    if (msg.guild && msg.mentions.length === 1 && msg.mentions[0].id === rem.user.id) {
                        this.p.checkPermission(msg, 'fun.cleverbot', (err) => {
                            if (err) {
                                this.s.logCmdStat(msg, 'cleverbot', false, 'permission');
                                return msg.channel.createMessage(`No permission to use \`fun.cleverbot\``);
                            }
                            this.s.logCmdStat(msg, 'cleverbot', true);
                            this.c.talk(msg);
                        });
                    }
                }
            });
        }
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

    }
}
module.exports = CmdManager;