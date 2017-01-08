/**
 * Created by julia on 07.11.2016.
 */
let Manager = require('../../structures/manager');
const winston = require('winston');
const recursive = require('recursive-readdir');
let path = require("path");
let async = require('async');
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
let beta = require('../../config/main.json').beta;
let stat = beta ? 'rem-beta' : 'rem-live';
class MessageManager extends Manager {
    constructor({cm, lm, gm, vm, um, pm, rm, stm, mod}, ...args) {
        super();
        this.setMaxListeners(20);
        this.l = lm;
        this.v = vm;
        this.lngs = lm.list;
        this.t = lm.getT();
        this.g = gm;
        this.p = pm;
        this.c = cm;
        this.s = stm;
        this.u = um;
        this.r = rm;
        this.mod = mod;
        this.commands = {};
        this.ready = false;
    }

    init() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.load(that.mod).then(() => {
                resolve();
            });
        });
    }

    load(mod) {
        let that = this;
        return new Promise(function (resolve, reject) {
            recursive(path.join(__dirname, '../../commands'), (err, files) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                let commands = {};
                for (let file of files) {
                    if (file.endsWith('.js')) {
                        let command = require(file);
                        let cmd = new command({t: that.t, v: that.v, mod});
                        commands[cmd.cmd] = cmd;
                    }
                }
                that.commands = commands;
                that.emit('ready', commands);
                that.ready = true;
                resolve();
            });
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
                            dogstatsd.increment(`${stat}.commands`);
                            msg.lang = [Guild.lng, 'en'];
                            msg.lngs = this.lngs;
                            msg.prefix = Guild.prefix;
                            let node = `${command.cat}.${command.cmd}`;
                            this.p.checkPermission(msg, node, (err) => {
                                if (err) {
                                    dogstatsd.increment(`${stat}.failed-commands`);
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
                                        dogstatsd.increment(`${stat}.failed-commands`);
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
                        dogstatsd.increment(`${stat}.commands`);
                        if (msg.content === `${rem.user.mention} prefix` || msg.content === `<@!${rem.user.id}> prefix`) {
                            return msg.channel.createMessage(`\`${msg.db.prefix}\``);
                        }
                        this.p.checkPermission(msg, 'fun.cleverbot', (err) => {
                            if (err) {
                                dogstatsd.increment(`${stat}.failed-commands`);
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
module.exports = {
    class: MessageManager,
    deps: ['lm', 'vm', 'gm', 'um', 'pm', 'rm', 'cm', 'stm'],
    async: true,
    shortcode: 'mm'
};