/**
 * Created by julia on 27.01.2017.
 */
let Command = require('../../structures/command');
let axios = require('axios');
let winston = require('winston');
const Selector = require('../../structures/selector');
const Menu = require('../../structures/menu');
class MangaSearch extends Command {
    constructor({t}) {
        super();
        this.cmd = 'manga';
        this.cat = 'misc';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
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
            let mangaRequest = await axios({
                url: `https://anilist.co/api/manga/search/${encodeURI(searchQuery)}`,
                params: {access_token: accessToken}
            });
            if (mangaRequest.data.error) {
                if (mangaRequest.data.error.messages[0] === 'No Results.') {
                    return msg.channel.createMessage(this.t('define.no-result', {lngs: msg.lang, term: searchQuery}));
                }
            }
            if (mangaRequest.data.length === 1) {
                let characters = await this.loadCharacters(mangaRequest.data[0].id, accessToken);
                let embed = this.buildResponse(msg, mangaRequest.data[0], characters);
                return msg.channel.createMessage(embed);
            } else if (mangaRequest.data.length > 1) {
                let pick = await new Menu(this.t('search.anime', {lngs: msg.lang}), this.t('menu.guide', {lngs: msg.lang}), mangaRequest.data.map(m => {
                    return (m.title_english !== m.title_romaji ? `${m.title_romaji} | ${m.title_english}` : m.title_romaji)
                }).slice(0, 10), this.t, msg);
                if (pick === -1) {
                    return msg.channel.createMessage(this.t('generic.cancelled-command', {lngs: msg.lang}));
                }
                if (pick > -1) {
                    let manga = mangaRequest.data[pick];
                    let characters = await this.loadCharacters(manga.id, accessToken);
                    let embed = this.buildResponse(msg, manga, characters);
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

    async loadCharacters(id, token) {
        let characterRequest = await axios({
            url: `https://anilist.co/api/manga/${id}/characters`,
            params: {access_token: token}
        });
        return characterRequest.data.characters;
    }

    buildResponse(msg, data, characters) {
        let description = data.description.replace(/<br>/g, '');
        description = description.replace(/\n|\\n/g, '');
        description = description.replace(/&mdash;/g, '');
        description = description.split('.').join('.\n\n');
        if (description.length > 1024) {
            description = description.substring(0, 1020);
            description += '...';
        }
        let mainCharacters = characters.filter((c) => {
            return c.role === 'Main';
        });
        let characterString = mainCharacters.map(c => {
            return `[${c.name_first}${c.name_last ? ` ${c.name_last}` : ''}](https://anilist.co/character/${c.id})`
        });
        characterString = characterString.join(', ');
        let titleString = data.title_english !== data.title_romaji ? `${data.title_romaji} | ${data.title_english}` : data.title_romaji;
        return {
            embed: {
                "title": titleString,
                "description": description,
                "url": `https://anilist.co/manga/${data.id}/`,
                "color": 0x00ADFF,
                "footer": {
                    "text": `⭐${this.t('anime.score', {lngs: msg.lang})}: ${data.average_score}/100`
                },
                "image": {
                    "url": data.image_url_lge
                },
                "fields": [
                    {
                        "name": `:movie_camera: ${this.t('anime.genres', {lngs: msg.lang})}`,
                        "value": `**${data.genres.join(', ')}**`
                    },
                    {
                        "name": `:1234: ${this.t('manga.chapters', {lngs: msg.lang})}`,
                        "value": `**${data.total_chapters > 0 ? data.total_chapters : `${this.t('generic.unknown', {lngs: msg.lang})}` }**`
                    },
                    {
                        "name": `:man_dancing: ${this.t('anime.characters', {lngs: msg.lang})}`,
                        "value": `**${characterString}**`
                    }
                ]
            }
        };
    }
}
module.exports = MangaSearch;