/**
 * Created by Julian on 25.05.2017.
 */
const utils = require('./utilities');
class Menu {
    constructor(description, choices, t, msg) {
        this.t = t;
        this.msg = msg;
        this.choices = choices;
        let content = utils.renderList(utils.prefixIndex(choices));
        let menuText = this.buildMenu(description, content, t, msg.lngs);
        this.sendMenuMessage(msg, menuText);
        this.sendWrongUsage = false;
        return this.setUpListener(msg);
    }

    sendMenuMessage(msg, content) {
        msg.channel.createMessage(content);
    }

    setUpListener(msg) {
        return new Promise((res, rej) => {
            let collector = msg.CON.addCollector(msg.channel.id, {
                filter: (collectorMsg) => {
                    return collectorMsg.author.id === msg.author.id;
                }
            });
            collector.on('message', (collectorMsg) => {
                try {
                    collectorMsg = parseInt(collectorMsg);
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
                if (collectorMsg - 1 > this.choices.length) {
                    console.log(collectorMsg);
                }

            });
        });
    }

    buildMenu(description, content, t, lang) {
        return `\`\`\`
        ${description}
        
        ${content}
        
        ${t('menu.guide', {lngs: lang})};
        \`\`\``
    }
}
module.exports = Menu;