/**
 * Created by Julian/Wolke on 07.11.2016.
 */
//owo
let Manager = require('../../structures/manager');
const winston = require('winston');
const recursive = require('recursive-readdir');
let path = require('path');
let async = require('async');
let StatsD = require('hot-shots');
let dogstatsd = new StatsD({host: remConfig.statsd_host});
let stat = `rem_${remConfig.environment}`;
class MessageManager extends Manager {
    constructor({cm, lm, gm, vm, um, pm, rm, sm, stm, mod}) {
        super();
        this.setMaxListeners(20);
        this.l = lm;
        this.v = vm;
        this.lngs = lm.getList();
        this.t = lm.getT();
        this.g = gm;
        this.p = pm;
        this.c = cm;
        this.sm = sm;
        this.s = stm;
        this.u = um;
        this.r = rm;
        this.mod = mod;
        this.commands = {};
        this.aliases = {};
        this.ready = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.load(this.mod).then(() => {
                resolve();
            });
        });
    }

    load(mod) {
        return new Promise((resolve, reject) => {
            recursive(path.join(__dirname, '../../commands'), (err, files) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                let commands = {};
                for (let file of files) {
                    if (file.endsWith('.js')) {
                        let command = require(file);
                        let cmd = new command({t: this.t, v: this.v, mod});
                        commands[cmd.cmd] = cmd;
                        if (cmd.aliases && cmd.aliases.length > 0) {
                            cmd.aliases.forEach((alias) => {
                                this.aliases[alias] = cmd.cmd;
                            });
                        }
                    }
                }
                this.commands = commands;
                this.emit('ready', commands);
                this.ready = true;
                resolve();
            });
        });
    }

    reload() {

    }

    unload() {

    }

    async check(msg) {
        if (this.ready) {
            try {
                let Data = await this.loadData(msg);
                let Guild = Data.guild;
                let User = Data.user;
                msg.db = Guild;
                msg.dbUser = User;
                msg.cmds = this.commands;
                if (msg.content.startsWith(Guild.prefix)) {
                    try {
                        let cmd = msg.content.substr(Guild.prefix.length).split(' ')[0];
                        let command = this.commands[cmd];
                        if (typeof (command) === 'undefined') {
                            if (typeof (this.aliases[cmd]) !== 'undefined') {
                                command = this.commands[this.aliases[cmd]];
                            }
                        }
                        if (typeof (command) !== 'undefined') {
                            dogstatsd.increment(`${stat}.commands`);
                            msg.lang = [Guild.lng, 'en'];
                            msg.lngs = this.lngs;
                            msg.prefix = Guild.prefix;
                            msg.aliases = this.aliases;
                            let node = `${command.cat}.${command.cmd}`;
                            try {
                                await this.p.checkPermission(msg, node);
                            } catch (e) {
                                dogstatsd.increment(`${stat}.failed-commands`);
                                this.s.logCmdStat(msg, cmd, false, 'permission');
                                return msg.channel.createMessage(this.t('generic.no-permission', {
                                    lngs: msg.lang,
                                    node: node
                                }));
                            }
                            console.log(cmd);
                            if (command.needGuild) {
                                if (msg.channel.guild) {
                                    this.s.logCmdStat(msg, cmd, true);
                                    command.run(msg);
                                } else {
                                    dogstatsd.increment(`${stat}.failed-commands`);
                                    this.s.logCmdStat(msg, cmd, false, 'need-guild');
                                    return msg.channel.createMessage(this.t('generic.no-pm', {lngs: msg.lang}));
                                }
                            } else {
                                this.s.logCmdStat(msg, cmd, true);
                                command.run(msg);
                            }
                        }
                    }
                    catch (err) {
                        winston.error(err.message);
                        winston.error(err.stack);
                    }
                } else {
                    if (msg.channel.guild && (msg.content.startsWith(rem.user.mention) || msg.content.startsWith(`<@!${rem.user.id}>`))) {
                        dogstatsd.increment(`${stat}.commands`);
                        if (msg.content === `${rem.user.mention} prefix` || msg.content === `<@!${rem.user.id}> prefix`) {
                            return msg.channel.createMessage(`\`${msg.db.prefix}\``);
                        }
                        try {
                            await this.p.checkPermission(msg, 'fun.cleverbot');
                        } catch (e) {
                            dogstatsd.increment(`${stat}.failed-commands`);
                            this.s.logCmdStat(msg, 'cleverbot', false, 'permission');
                            return msg.channel.createMessage(this.t('generic.no-permission', {
                                lngs: msg.lang,
                                node: 'fun.cleverbot'
                            }));
                        }
                        this.s.logCmdStat(msg, 'cleverbot', true);
                        this.c.talk(msg);

                    } else if (msg.channel.guild) {
                        // this.r.filterReaction(msg);
                        // this.u.increaseExperience(msg).then(() => {
                        //
                        // }).catch(err => winston.error);
                    }
                }
            } catch (e) {
                winston.error(e);
            }
        } else {
            winston.error('Not ready!');
        }
    }

    async loadData(msg) {
        let results = {};
        results.guild = await this.loadGuild(msg);
        results.user = await this.loadUser(msg);
        return Promise.resolve(results);
    }

    async loadGuild(msg) {
        if (msg.channel.guild) {
            winston.debug(`Loading Guild ${msg.channel.guild.id}|${msg.channel.guild.name} via Message Manager!`);
            let Guild = await this.g.loadGuild(msg.channel.guild.id);
            winston.debug(`Loaded Guild ${msg.channel.guild.id}|${msg.channel.guild.name} via Message Manager!`);
            if (typeof (Guild) === 'undefined') {
                Guild = {};
                winston.debug(`Guild:${msg.channel.guild.id}|${msg.channel.guild.name} was not found!`);
            }
            if (typeof (Guild.lng) === 'undefined') {
                Guild.lng = 'en';
                winston.debug(`Guild:${msg.channel.guild.id}|${msg.channel.guild.name} setting lang to en`);
            }
            if (typeof (Guild.prefix) === 'undefined') {
                Guild.prefix = '!w.';
                winston.debug(`Guild:${msg.channel.guild.id}|${msg.channel.guild.name} setting prefix to !w.`);
            }
            return Guild;
        } else {
            winston.debug(`There was no Guild attached to the msg, using default settings!`);
            return {prefix: '!w.', lng: 'en'};
        }
    }

    async loadUser(msg) {
        winston.debug(`Loading User ${msg.author.id}|${msg.author.username}#${msg.author.discriminator} via Message Manager`);
        return this.u.loadUser(msg.author);
    }
}
module.exports = {
    class: MessageManager,
    deps: ['lm', 'vm', 'gm', 'um', 'pm', 'rm', 'cm', 'sm', 'stm'],
    async: true,
    shortcode: 'mm'
};