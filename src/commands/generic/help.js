/**
 * Created by Julian on 10.05.2017.
 */
let Command = require('../../structures/command');
let winston = require('winston');
class Help extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'help';
        this.aliases = ['commands', 'h', 'cmds'];
        this.cat = 'generic';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.msg = null;
        this.r = mod.getMod('raven');
        this.help = {
            short: 'help.help.short',
            usage: 'help.help.usage',
            example: 'help.help.example'
        }
    }

    run(msg) {
        let args = msg.content.split(' ').splice(1);
        if (args.length > 0) {
            let cmd = args[0].trim();
            if (cmd.startsWith(msg.prefix)) {
                cmd = cmd.substring(msg.prefix.length);
            }
            let command = msg.cmds[cmd];
            if (!command) {
                if (msg.aliases[cmd]) {
                    command = msg.cmds[msg.aliases[cmd]];
                }
            }
            if (command && !command.hidden) {
                if (command.help) {
                    return msg.channel.createMessage(this.buildCommandHelp(msg, command));
                } else {
                    return msg.channel.createMessage(this.t('help.command-no-detail', {
                        lngs: msg.lang,
                        legacy_help: this.t(`help.${cmd}`, {lngs: msg.lang})
                    }));
                }
            } else {
                return msg.channel.createMessage(this.t('help.command-not-exists', {
                    lngs: msg.lang,
                    prefix: msg.prefix,
                    cmd
                }));
            }
        } else {
            return msg.channel.createMessage(this.buildCategoryHelp(msg, msg.cmds));
        }
    }

    /**
     * Function that builds a help message for the specific command
     * @param {Object} msg The message that triggered the help
     * @param {Object} command Command to build the help for
     * @return {String}
     */
    buildCommandHelp(msg, command) {
        let helpMessage = "";
        helpMessage += this.t('help.command-help-title', {
                lngs: msg.lang,
                command: command.cmd,
                prefix: msg.prefix
            }) + '\n';
        if (command.aliases.length > 0) {
            command.aliases = command.aliases.map(a => `\`${a}\``);
            helpMessage += this.t('help.command-aliases', {lngs: msg.lang, aliases: command.aliases.join(', ')}) + '\n';
        }
        if (command.help.short) {
            helpMessage += this.t('help.command-shorthelp', {lngs: msg.lang}) + ' ' + `\`${this.t(command.help.short, {lngs: msg.lang})}\`` + '\n';
        }
        if (command.help.long) {
            helpMessage += this.t('help.command-longhelp', {lngs: msg.lang}) + '\n' + `\`\`\`${this.t(command.help.long, {lngs: msg.lang})}\`\`\`` + '\n';
        }
        if (command.help.usage) {
            helpMessage += this.t('help.command-usage', {lngs: msg.lang}) + ' ' + `\`${this.t(command.help.usage, {
                    lngs: msg.lang,
                    prefix: msg.prefix
                })}\`` + '\n';
        }
        if (command.help.example) {
            helpMessage += this.t('help.command-example', {lngs: msg.lang}) + '\n' + `${this.t(command.help.example, {
                    lngs: msg.lang,
                    prefix: msg.prefix
                })}` + '\n';
        }
        return helpMessage;
    }

    /**
     * Function that builds a for a list of commands with their categories
     * @param {Object} msg The message that triggered the help
     * @param {Object} commands Map of commands with data like category, trigger and so on
     */
    buildCategoryHelp(msg, commands) {
        let categories = {};
        let helpMessage = "";
        helpMessage += this.t('help.introduction', {
                lngs: msg.lang,
                name: rem.user.username,
                prefix: msg.prefix
            }) + '\n';
        helpMessage += this.t('help.categories.list', {lngs: msg.lang}) + '\n';
        for (let key in commands) {
            if (commands.hasOwnProperty(key)) {
                let command = commands[key];
                if (!command.hidden) {
                    if (!categories[command.cat]) {
                        categories[command.cat] = [command];
                    } else {
                        categories[command.cat].push(command);
                    }
                }
            }
        }
        let sortedCategories = [];
        for (let key in categories) {
            if (categories.hasOwnProperty(key)) {
                let category = categories[key];
                sortedCategories.push(key);
                categories[key].sort((a, b) => {
                    if (a.cmd > b.cmd) {
                        return 1;
                    }
                    if (a.cmd < b.cmd) {
                        return -1;
                    }
                    return 0;
                })
            }
        }
        sortedCategories.sort((a, b) => {
            let aCatValue = this.getCategoryRanking(a);
            let bCatValue = this.getCategoryRanking(b);
            if (aCatValue > bCatValue) {
                return 1;
            }
            if (aCatValue < bCatValue) {
                return -1;
            }
            return 0;
        });
        for (let i = 0; i < sortedCategories.length; i++) {
            let category = categories[sortedCategories[i]];
            helpMessage += '**' + this.t(`help.categories.${sortedCategories[i]}`, {lngs: msg.lang}) + '**' + ': ';
            for (let x = 0; x < category.length; x++) {
                helpMessage += `\`${category[x].cmd}\``;
                if (category.length - 1 !== x) {
                    helpMessage += ', ';
                }
            }
            helpMessage += '\n\n'
        }
        return helpMessage;
    }

    /**
     * Returns the sorting number for a ranking in help
     * @param {String} category Name of the category to be evaluated
     * @return {Number}
     */
    getCategoryRanking(category) {
        let ranking = 0;
        switch (category) {
            case 'generic':
                ranking = 0;
                break;
            case 'fun':
                ranking = 1;
                break;
            case 'image':
                ranking = 2;
                break;
            case 'music':
                ranking = 3;
                break;
            case 'radio':
                ranking = 4;
                break;
            case 'playlist':
                ranking = 5;
                break;
            case 'moderation':
                ranking = 6;
                break;
            case 'permission':
                ranking = 7;
                break;
            case 'misc':
                ranking = 8;
                break;
            case 'nsfw':
                ranking = 9;
                break;
        }
        return ranking;
    }
}
module.exports = Help;