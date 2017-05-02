/**
 * Created by julia on 27.01.2017.
 */
let Command = require('../../structures/command');
let axios = require('axios');
let winston = require('winston');
const Selector = require('../../structures/selector');
class AnimeSearch extends Command {
    constructor({t}) {
        super();
        this.cmd = 'anime';
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
            let animeRequest = await axios({
                url: `https://anilist.co/api/anime/search/${encodeURI(searchQuery)}`,
                params: {access_token: accessToken}
            });
            if (animeRequest.data.error) {
                if (animeRequest.data.error.messages[0] === 'No Results.') {
                    return msg.channel.createMessage(this.t('define.no-result', {lngs: msg.lang, term: searchQuery}));
                }
            }
            if (animeRequest.data.length === 1) {
                let characters = await this.loadCharacters(animeRequest.data[0].id, accessToken);
                let embed = this.buildResponse(msg, animeRequest.data[0], characters);
                return msg.channel.createMessage(embed);
            } else if (animeRequest.data.length > 1) {
                let selector = new Selector(msg, animeRequest.data.map(a => {
                    return {title: a.title_english !== a.title_romaji ? `${a.title_romaji} | ${a.title_english}` : a.title_romaji}
                }).slice(0, 8), this.t, (async (err, number) => {
                    if (err) {
                        console.error(err);
                        return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                    }
                    let anime = animeRequest.data[number - 1];
                    let characters = await this.loadCharacters(anime.id, accessToken);
                    let embed = this.buildResponse(msg, anime, characters);
                    return msg.channel.createMessage(embed);
                }));
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
            url: `https://anilist.co/api/anime/${id}/characters`,
            params: {access_token: token}
        });
        return characterRequest.data.characters;
    }

    buildResponse(msg, data, characters) {
        let description = data.description.replace(/<br>/g, '');
        description = description.replace(/\n|\\n/g, '');
        description = description.replace(/&mdash;/g, '');
        description = description.split('.').join('.\n\n');
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
                "url": `https://anilist.co/anime/${data.id}/`,
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
                        "name": `:1234: ${this.t('anime.episodes', {lngs: msg.lang})}`,
                        "value": `**${data.total_episodes > 0 ? data.total_episodes : `${this.t('generic.unknown', {lngs: msg.lang})}` }**`
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
module.exports = AnimeSearch;