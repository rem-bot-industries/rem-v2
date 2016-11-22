/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
var MessageCollector = require('discord.js').MessageCollector;
var PermManager = require('../modules/permissionManager');
class Help extends Command {
    constructor(t) {
        super();
        this.cmd = "help";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.categories = [];
        this.categories_name = [];
        this.msg = null;
        this.p = new PermManager();
    }

    run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (this.categories.length < 1) {
            this.buildHelp(msg);
        }
        this.msg = msg;
        msg.author.sendMessage("", {
            embed: {
                author: {name: "Command categories"},
                footer: {text: "Type !w.help number to get the commands of a category"},
                fields: this.categories_name,
                color: 0x00ADFF
            }
        }).then(msg => {
            this.startCollector(msg);
        });
        if (msg.guild) {
            msg.reply(this.t('help.helpReply', {lngs: msg.lang, pre: msg.prefix}));
        }
    }

    buildHelp(msg) {
        let commands = msg.cmds;
        let i = 1;
        for (var command in commands) {
            if (commands.hasOwnProperty(command)) {
                var cmd = commands[command];
                if (typeof (cmd.hidden) !== 'undefined') {

                } else if (this.checkCat(cmd.cat, this.categories)) {
                    this.categories = this.pushCat(cmd, this.categories);
                } else {
                    this.categories.push({name: cmd.cat, commands: [cmd]});
                    this.categories_name.push({name: i, value: cmd.cat, inline: true});
                    i += 1;
                }
            }
        }
    }

    startCollector(origMsg) {
        let collector = new MessageCollector(origMsg.channel, (msg, coll) => {
            if (msg.author.id === this.msg.author.id) {
                return true
            }
        }, {time: 1000 * 30});
        collector.on('message', (msg) => {
            let number = 0;
            try {
                number = parseInt(msg.content);
            } catch (e) {
                return msg.channel.sendMessage(this.t('generic.whole-num'));
            }
            if (isNaN(number)) {
                return msg.channel.sendMessage(this.t('generic.nan'));
            }
            if (number < 1) {
                return msg.channel.sendMessage(this.t('generic.negative', {number: number}));
            }
            if (msg.content.startsWith(msg.prefix)) {
                collector.stop();
            }
            if (msg.content === 'c') {
                collector.stop();
            }
            if (!isNaN(number) && number <= this.categories.length) {
                collector.stop();
                let data = this.categories[number - 1].commands;
                let fields = [];
                for (let i = 0; i < data.length; ++i) {
                    fields.push({
                        name: `${this.msg.prefix}${data[i].cmd}`,
                        value: `${this.t(`help.${data[i].cmd}`, {
                            lngs: this.msg.lang,
                            languages: this.buildLang(this.msg.lngs)
                        })}`,
                        inline: true
                    });
                }
                let reply = {
                    embed: {
                        author: {name: `${this.t(`help.${this.categories[number - 1].name}`, {lngs: this.msg.lang})}`},
                        fields: fields,
                        color: 0x00ADFF
                    }
                };
                msg.channel.sendMessage("", reply).then(msg => {

                });
            }
        });
    }

    buildLang(list) {
        let i = list.length;
        let answer = "";
        while (i--) {
            if (list[i] !== 'dev') {
                answer = answer + `${list[i]} | `;
            }
        }
        return answer;
    }

    checkCat(cat, list) {
        let i = list.length;
        while (i--) {
            if (cat === list[i].name) {
                return true;
            }
        }
        return false;
    }

    pushCat(cmd, list) {
        let i = list.length;
        while (i--) {
            if (cmd.cat === list[i].name) {
                list[i].commands.push(cmd);
            }
        }
        return list;
    }
}
module.exports = Help;