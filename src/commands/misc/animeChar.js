/**
 * Created by julia on 27.01.2017.
 */
let Command = require('../../structures/command');
let axios = require('axios');
let winston = require('winston');
const Menu = require('../../structures/menu');
class AnimeSearch extends Command {
    constructor({t}) {
        super();
        this.cmd = 'char';
        this.cat = 'misc';
        this.aliases = ['character', 'animechar'];
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.help = {
            short: 'help.char.short',
            usage: 'help.char.usage',
            example: 'help.char.example'
        }
    }

    async run(msg) {
        let searchQuery = msg.content.substring(msg.prefix.length + this.cmd.length + 1);
        if (!searchQuery) return await msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));
        try {
            let authRequest = await axios.post(`https://anilist.co/api/auth/access_token`, {
                grant_type: 'client_credentials',
                client_id: remConfig.anilist_id,
                client_secret: remConfig.anilist_secret
            });
            let accessToken = authRequest.data.access_token;
            let characterRequest = await axios({
                url: `https://anilist.co/api/character/search/${encodeURI(searchQuery)}`,
                params: {access_token: accessToken}
            });
            if (characterRequest.data.error) {
                if (characterRequest.data.error.messages[0] === 'No Results.') {
                    return msg.channel.createMessage(this.t('define.no-result', {lngs: msg.lang, term: searchQuery}));
                }
            }
            // console.log(characterRequest.data);
            if (characterRequest.data.length === 1) {
                let embed = this.buildResponse(characterRequest.data[0]);
                return msg.channel.createMessage(embed);
            } else if (characterRequest.data.length > 1) {
                let pick = await new Menu(this.t('search.anime', {lngs: msg.lang}), this.t('menu.guide', {lngs: msg.lang}), characterRequest.data.map(c => {
                    return `${c.name_first} ${c.name_last ? c.name_last : ''} ${c.name_japanese ? ('(' + c.name_japanese + ')') : ''}`
                }).slice(0, 15), this.t, msg);
                if (pick === -1) {
                    return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                }
                if (pick > -1) {
                    let character = characterRequest.data[pick];
                    let embed = this.buildResponse(character);
                    return msg.channel.createMessage(embed);
                }
            } else {
                return msg.channel.createMessage(this.t('define.no-result', {lngs: msg.lang, term: searchQuery}));
            }
        } catch (e) {
            console.error(e);
            await msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        }
    }

    buildResponse(data) {
        // console.log(data);
        let info = data.info.replace(/<br>/g, '');
        info = info.replace(/\n|\\n/g, '');
        info = info.replace(/&mdash;/g, '');
        info = info.replace(/&#039;/g, '');
        info = info.split('.').join('.\n\n');
        if (info.indexOf('~!') > -1 && info.indexOf('!~') > 1) {
            info = this.filterSpoilers(info);
        }
        if (info.length > 1024) {
            info = info.substring(0, 1020);
            info += '...';
        }
        let titleString = `${data.name_first} ${data.name_last ? data.name_last : ''} ${data.name_japanese ? ('(' + data.name_japanese + ')') : ''}`;
        return {
            embed: {
                "title": titleString,
                "description": info,
                "url": `https://anilist.co/character/${data.id}/`,
                "color": 0x00ADFF,
                "image": {
                    "url": data.image_url_lge
                }
            }
        };
    }

    filterSpoilers(info) {
        let info1 = info.substring(0, info.indexOf('~!') - 1);
        info = info1.concat(info.substring(info.indexOf('!~') + 2));
        if (info.indexOf('~!') > -1 && info.indexOf('!~') > 1) {
            return this.filterSpoilers(info);
        }
        return info;
    }
}
module.exports = AnimeSearch;