/**
 * Created by Julian on 28.05.2017.
 */
const Command = require('../../structures/command');
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

    async run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        if (messageSplit.length === 0) {
            //TODO Write interactive setup and return
        } else {
            let categories = utils.getCategoriesFromCommands(msg.cmds, true);
            let args = argParser.parse(messageSplit);
            try {
                let parsedArgs = this.parseArgs(args, categories, msg.cmds, msg.prefix);
                // console.log(parsedArgs);
                let target;
                if (parsedArgs.args.r) {
                    target = await this.resolveRole(parsedArgs, msg);
                    console.log(target);
                } else if (parsedArgs.args.u) {
                    target = await this.resolveUser(parsedArgs, msg);
                } else if (parsedArgs.args.c) {
                    target = await this.resolveChannel(parsedArgs, msg)
                }
                if (!target) {
                    target = {type: 'guild', id: msg.channel.guild.id};
                }
                // console.log(parsedArgs);
                // console.log(target);
                let perm = this.p.createPermission(parsedArgs.permNode, target.type, target.id, args.allow);
                
                return msg.channel.createMessage(JSON.stringify(perm));
            } catch (e) {
                console.log(e);
                // return msg.channel.createMessage(this.t(e.t, {lngs: msg.lang, node: e.node, prefix:msg.prefix}));
            }
        }
    }

    async resolveRole(parsedArgs, msg) {
        let fullArgs = this.addOverleftArgs(parsedArgs.args.r, parsedArgs.args._);
        fullArgs = fullArgs.trim();
        if (regs.role.test(fullArgs)) {
            fullArgs = fullArgs.substring(3);
            return {type: 'role', id: fullArgs.substring(0, fullArgs.length - 1)};
        } else {
            let roles = utils.searchRoles(msg.channel.guild.roles, fullArgs);
            let pick = await searcher.roleSearchMenu(msg, [fullArgs], this.t);
            if (pick === -1) {
                throw new TranslatableError({
                    t: 'generic.cancelled-command',
                    message: 'User entered a wrong response to menu'
                })
            }
            if (pick === -2) {
                throw new TranslatableError({t: 'search.no-results', message: 'No matching roles could be found'})
            }
            if (pick > -1) {
                let targetRole = roles[pick];
                return {type: 'role', id: targetRole.id};
            }
        }
    }

    async resolveUser(parsedArgs, msg) {
        let fullArgs = this.addOverleftArgs(parsedArgs.args.u, parsedArgs.args._);
        fullArgs = fullArgs.trim();
        if (regs.user.test(fullArgs)) {
            if (fullArgs.startsWith('<@!')) {
                fullArgs = fullArgs.substring(3);
            } else {
                fullArgs = fullArgs.substring(2);
            }
            return {type: 'user', id: fullArgs.substring(0, fullArgs.length - 1)};
        } else {
            let users = utils.searchUser(msg.channel.guild.members, fullArgs);
            let pick = await searcher.userSearchMenu(msg, [fullArgs], this.t);
            if (pick === -1) {
                throw new TranslatableError({
                    t: 'generic.cancelled-command',
                    message: 'User entered a wrong response to menu'
                })
            }
            if (pick === -2) {
                throw new TranslatableError({t: 'search.no-results', message: 'No matching members could be found'})
            }
            if (pick > -1) {
                let targetRole = users[pick];
                return {type: 'user', id: targetRole.id};
            }
        }
    }

    async resolveChannel(parsedArgs, msg) {
        let fullArgs = this.addOverleftArgs(parsedArgs.args.c, parsedArgs.args._, true);
        fullArgs = fullArgs.trim();
        if (regs.user.test(fullArgs)) {
            fullArgs = fullArgs.substring(2);
            return {type: 'channel', id: fullArgs.substring(0, fullArgs.length - 1)};
        } else {
            let channels = utils.searchChannel(msg.channel.guild.channels, fullArgs);
            let pick = await searcher.channelSearchMenu(msg, [fullArgs], this.t);
            if (pick === -1) {
                throw new TranslatableError({
                    t: 'generic.cancelled-command',
                    message: 'User entered a wrong response to menu'
                })
            }
            if (pick === -2) {
                throw new TranslatableError({t: 'search.no-results', message: 'No matching channels could be found'})
            }
            if (pick > -1) {
                let targetRole = channels[pick];
                return {type: 'channel', id: targetRole.id};
            }
        }
    }

    addOverleftArgs(coreArgs, overlefts, dash = false) {
        let separator = dash ? '-' : ' ';
        if (overlefts.length > 0) {
            for (let i = 0; i < overlefts.length; i++) {
                coreArgs += separator + overlefts[i];
            }
        }
        return coreArgs;
    }

    parseArgs(args, categories, cmds, prefix) {
        console.log(args);
        if (args._.length > 0) {
            let parsedPermnode = this.parsePermNode(args, categories, cmds, prefix);
            let permNode = parsedPermnode.permNode;
            args = parsedPermnode.args;
            let parsedAllow = this.parseAllow(args);
            args = parsedAllow.args;
            let allow = parsedAllow.allow;
            return {
                permNode,
                allow,
                args
            }
        }
        throw new TranslatableError({
            t: 'ap.missing-args',
            message: 'not enough arguments were passed with the message'
        })
    }

    parseAllow(args) {
        let res = {allow: false, args};
        for (let i = 0; i < args._.length; i++) {
            let allow = args._[i];
            if (allow === 'true') {
                res.allow = true;
                res.args._.splice(i, 1);
                return res;
            }
            if (allow === 'false') {
                res.allow = false;
                res.args._.splice(i, 1);
                return res;
            }
        }
        throw new TranslatableError({
            t: 'ap.no-allowance-set',
            message: 'no false or true found in the args'
        })
    }

    parsePermNode(args, categories, cmds, prefix) {
        let res = {permNode: '', args};
        for (let i = 0; i < args._.length; i++) {
            let nodeSplit = args._[i].split(".");
            let permNode = "";
            let node = "";
            if (nodeSplit.length === 2) {
                if (typeof(categories[nodeSplit[0]]) !== 'undefined') {
                    if (typeof (cmds[nodeSplit[1]]) !== 'undefined') {
                        let cmd = cmds[nodeSplit[1]];
                        res.args._.splice(i, 1);
                        res.permNode = `${cmd.cat}.${cmd.cmd}`;
                        return res;
                    }
                    if (nodeSplit.join('.') === 'fun.cleverbot') {
                        res.args._.splice(i, 1);
                        res.permNode = `fun.cleverbot`;
                        return res;
                    }
                    if (nodeSplit[1] === '*') {
                        res.args._.splice(i, 1);
                        res.permNode = `${nodeSplit[0]}.*`;
                        return res;
                    }
                }
                if (typeof (cmds[nodeSplit[1]]) !== 'undefined') {
                    let cmd = cmds[nodeSplit[1]];
                    res.args._.splice(i, 1);
                    res.permNode = `${cmd.cat}.${cmd.cmd}`;
                    return res;
                }
            } else {
                if (nodeSplit.length === 1) {
                    permNode = nodeSplit[0];
                    if (permNode === "*") {
                        permNode = "*.*";
                    }
                    if (permNode.startsWith(prefix)) {
                        let cmd = cmds[permNode.substring(prefix.length)];
                        if (typeof (cmd) === 'undefined') {
                            throw new TranslatableError({
                                t: 'ap.wrong-node',
                                message: 'Length of split of first argument did not equal 1 or 2'
                            });
                        }
                        res.args._.splice(i, 1);
                        res.permNode = `${cmd.cat}.${cmd.cmd}`;
                        return res;
                    }
                    if (typeof (cmds[permNode]) !== 'undefined') {
                        let cmd = cmds[permNode];
                        res.args._.splice(i, 1);
                        res.permNode = `${cmd.cat}.${cmd.cmd}`;
                        return res;
                    }
                }
            }
        }
        throw new TranslatableError({
            t: 'ap.wrong-node',
            message: 'Length of split of first argument did not equal 1 or 2',
            node: args._[0]
        });
    }
}
module.exports = AddPermission;