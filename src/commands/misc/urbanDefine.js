/**
 * Created by julia on 27.01.2017.
 */
let Command = require('../../structures/command');
let axios = require('axios');
let key = require('../../../config/main.json').mashape_key;
let winston = require('winston');
class UrbanDictionary extends Command {
    constructor({t}) {
        super();
        this.cmd = 'define';
        this.cat = 'misc';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    async run(msg) {
        let term = msg.content.substring(msg.prefix.length + this.cmd.length + 1);
        if (!term) return await msg.channel.createMessage(this.t('define.empty-search', {lngs: msg.lang}));
        try {
            let result = await axios.get(`https://mashape-community-urban-dictionary.p.mashape.com/define`, {
                params: {"term": term},
                headers: {'X-Mashape-Key': key}
            });
            if (result.data.list.length > 0) {
                let urResult = result.data.list[0];
                await msg.channel.createMessage({
                    embed: {
                        author: {name: 'Urbandictionary', url: urResult.permalink},
                        title: `Definition of ${term}`,
                        description: urResult.definition,
                        footer: {text: `Made by: ${urResult.author}| 👍 ${urResult.thumbs_up}| 👎 ${urResult.thumbs_down}`},
                        color: 0x00ADFF
                    }
                })
            } else {
                await msg.channel.createMessage(this.t('define.no-result', {lngs: msg.lang}));
            }
        } catch (e) {
            console.error(e);
            await msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }
}
module.exports = UrbanDictionary;