/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
class Help extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "help";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.msg = null;
        this.p = mod.getMod('pm');
    }

    run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        let categoriesData = this.buildHelp(msg);
        this.msg = msg;
        if (msg.guild) {
            msg.channel.createMessage(`${msg.author.mention}, ${this.t('help.helpReply', {
                lngs: msg.lang,
                pre: msg.prefix
            })}`);
        }
        if (msgSplit.length > 0) {
            return this.exactHelp(msg, msgSplit, categoriesData);
        }
        categoriesData.categories_name.push({name: `Donate`, value: `https://www.patreon.com/rem_bot`});
        let reply = {
            embed: {
                author: {name: "Command categories"},
                footer: {text: "Type !w.help number to get the commands of a category"},
                fields: categoriesData.categories_name,
                color: 0x00ADFF
            }
        };
        if (msg.channel.type !== 1) {
            msg.author.getDMChannel().then(channel => {
                this.catReply(channel, reply);
            }).catch(e => winston.error);
        } else {
            this.catReply(msg.channel, reply);
        }
    }

    catReply(channel, reply) {
        channel.createMessage(reply).then(msg => {

        });
    }

    buildHelp(msg) {
        let commands = msg.cmds;
        let categories = [];
        let categories_name = [];
        let i = 1;
        for (let command in commands) {
            if (commands.hasOwnProperty(command)) {
                let cmd = commands[command];
                if (typeof (cmd.hidden) !== 'undefined') {

                } else if (this.checkCat(cmd.cat, categories)) {
                    categories = this.pushCat(cmd, categories);
                } else {
                    categories.push({name: cmd.cat, commands: [cmd]});
                    categories_name.push({name: i, value: cmd.cat});
                    i += 1;
                }
            }
        }
        return {categories, categories_name};
    }

    exactHelp(msg, msgSplit, {categories}) {
        let number = 0;
        try {
            number = parseInt(msgSplit[0]);
        } catch (e) {

        }
        if (isNaN(number) || number < 1) {
            let cat = this.checkCat(msgSplit[0], categories);
            if (cat) {
                this.sendReply(msg, cat);
            } else {
                if (msg.channel.type !== 1) {
                    msg.author.getDMChannel().then(channel => {
                        this.catReply(channel, this.t('generic.cat-nope', {lngs: msg.lang}));
                    }).catch(e => winston.error);
                } else {
                    this.catReply(msg.channel, this.t('generic.cat-nope', {lngs: msg.lang}));
                }
            }
        }
        if (number < 1) {
            if (msg.channel.type !== 1) {
                msg.author.getDMChannel().then(channel => {
                    this.catReply(channel, this.t('generic.negative', {number: number}));
                }).catch(e => winston.error);
            } else {
                this.catReply(msg.channel, this.t('generic.negative', {number: number}));
            }
        }
        if (!isNaN(number) && number <= categories.length) {
            this.sendReply(msg, categories[number - 1]);
        }
    }

    sendReply(msg, data) {
        let fields = [];
        for (let i = 0; i < data.commands.length; ++i) {
            fields.push({
                name: `${this.msg.prefix}${data.commands[i].cmd}`,
                value: `${this.t(`help.${data.commands[i].cmd}`, {
                    lngs: this.msg.lang,
                    languages: this.buildLang(this.msg.lngs)
                })}`
            });
        }
        fields.push({
            name: `Donate`,
            value: `https://www.patreon.com/rem_bot`
        });
        let reply = {
            embed: {
                author: {name: `${this.t(`help.${data.name}`, {lngs: this.msg.lang})}`},
                fields: fields,
                color: 0x00ADFF
            }
        };
        if (msg.channel.type !== 1) {
            msg.author.getDMChannel().then(channel => {
                this.catReply(channel, reply);
            }).catch(e => winston.error);
        } else {
            this.catReply(msg.channel, reply);
        }

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
                return list[i];
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