/**
 * Created by Julian on 25.05.2017.
 */
const utils = require('./utilities');
const winston = require('winston');
class Menu {
    constructor(title, description, choices, t, msg) {
        this.t = t;
        this.msg = msg;
        this.choices = choices;
        let content = utils.renderList(utils.prefixIndex(choices), 'js', true);
        this.menuText = this.buildMenu(title, description, content, t, msg.lang);
        this.menuMsg = null;
        this.sendWrongUsage = false;
        return this.setUpListener(msg);
    }

    sendMenuMessage(msg, content) {
        return msg.channel.createMessage(content);
    }

    setUpListener(msg) {
        return new Promise((res, rej) => {
            this.sendMenuMessage(msg, this.menuText).then(menuMsg => {
                this.menuMsg = menuMsg;
                let collector = msg.CON.addCollector(msg.channel.id, {
                    filter: (collectorMsg) => {
                        return collectorMsg.author.id === msg.author.id;
                    }
                });
                let stopTimeout = setTimeout(() => {
                    collector.end();
                    try {
                        this.menuMsg.delete();
                    } catch (e) {
                        winston.error(e);
                    }
                    res(-1);
                }, 1000 * 60 * 5); //5 mins
                collector.on('message', (collectorMsg) => {
                    if (collectorMsg.content.startsWith(msg.prefix) || collectorMsg.content === 'c') {
                        collector.end();
                        try {
                            this.menuMsg.delete();
                        } catch (e) {
                            winston.error(e);
                        }
                        clearTimeout(stopTimeout);
                        res(-1);
                        return;
                    }
                    let parseMsg;
                    try {
                        parseMsg = parseInt(collectorMsg.content);
                    } catch (e) {
                        console.error(e);
                        if (!this.sendWrongUsage) {
                            collectorMsg.channel.createMessage('menu.invalid_response', {lngs: msg.lang});
                            this.sendWrongUsage = true;
                            setTimeout(() => {
                                this.sendWrongUsage = false;
                            }, 500)
                        }
                    }
                    if (parseMsg - 1 < this.choices.length) {
                        collector.end();
                        try {
                            this.menuMsg.delete();
                            collectorMsg.delete();
                        } catch (e) {

                        }
                        clearTimeout(stopTimeout);
                        res(parseMsg - 1);
                    }
                });
            });
        });
    }

    buildMenu(title, description, content, t, lang) {
        return {
            content: `${title}`,
            embed: {
                title: description,
                footer: {
                    text: t('menu.disclaimer', {lngs: lang})
                },
                description: content
            }
        };
    }
}
module.exports = Menu;