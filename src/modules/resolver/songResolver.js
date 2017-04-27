/**
 * Created by Julian on 17.03.2017.
 */
let youtube = require('./youtubeResolver');
let soundcloud = require('./soundCloudResolver');
let osu = require('./osuResolver');
let twitch = require('./twitchResolver');
let youtubePlaylist = require('./youtubePlaylistResolver');
const winston = require('winston');
let crypto = require('crypto');
let keys;
let Cache;
let searchCache;
let KeyManager = require('../keyManager');
let axios = require('axios');
if (remConfig.redis_enabled) {
    Cache = require('./../../structures/redisCache');
    winston.debug('Using Redis Cache for Searches!');
} else {
    Cache = require('./../../structures/cache');
    searchCache = Cache;
    winston.debug('Using Map Cache for Searches!');
}
try {
    if (process.env.secret_keys_name) {
        keys = require(`/run/secrets/${process.env.secret_keys_name}`).keys;
    } else {
        keys = require('../../../config/keys.json').keys;
    }
} catch (e) {
    winston.error(e);
    winston.error('The file with the youtube keys could not be loaded!');
}
let km = new KeyManager(keys);
let opts = {
    maxResults: 10,
    key: km.getKey(),
    type: 'video',
    order: 'relevance'
};
class SongResolver {
    constructor(redis) {
        this.redis = redis;
        this.resolvers = {youtube, soundcloud, osu, twitch};
        this.playlistResolvers = {youtubePlaylist};
        if (remConfig.redis_enabled) {
            searchCache = new Cache(redis);
        }
    }

    checkUrl(url) {
        url = this.removeBracket(url);
        for (let resolver in this.resolvers) {
            if (this.resolvers.hasOwnProperty(resolver)) {
                if (this.resolvers[resolver].canResolve(url)) {
                    return true;
                }
            }
        }
        return false;
    }

    async resolve(url) {
        url = this.removeBracket(url);
        for (let resolver in this.resolvers) {
            if (this.resolvers.hasOwnProperty(resolver)) {
                if (this.resolvers[resolver].canResolve(url)) {
                    return this.resolvers[resolver].resolve(url);
                }
            }
        }
    }

    checkUrlPlaylist(url) {
        url = this.removeBracket(url);
        for (let resolver in this.playlistResolvers) {
            if (this.playlistResolvers.hasOwnProperty(resolver)) {
                if (this.playlistResolvers[resolver].canResolve(url)) {
                    return true;
                }
            }
        }
        return false;
    }

    async resolvePlaylist(url) {
        url = this.removeBracket(url);
        for (let resolver in this.playlistResolvers) {
            if (this.playlistResolvers.hasOwnProperty(resolver)) {
                if (this.playlistResolvers[resolver].canResolve(url)) {
                    return this.playlistResolvers[resolver].resolve(url);
                }
            }
        }
        throw new TranslatableError({t: 'generic.error', message: 'This playlist is not supported.'});
    }

    async search(search) {
        let searchHash = crypto.createHash('md5').update(search).digest('hex');
        winston.debug(`Generated Hash ${searchHash} for search term: ${search}`);
        // console.log(searchHash);
        let results = await searchCache.get(`youtube_search_${searchHash}`);
        if (results) {
            winston.debug(`Found Search with hash ${searchHash} in Cache!`);
            winston.debug(`Results: ${results}`);
            // console.log(results);
            return results;
        } else {
            let res;
            try {
                res = await this.searchRequest(search);
            } catch (e) {
                winston.error(e);
                winston.info('Switching Keys!');
                km.nextKey();
                opts.key = km.getKey();
                res = await this.searchRequest(search);
            }
            if (res.items.length > 0) {
                // console.log(res);
                let actualResult = res.items.map((item) => {
                    return {
                        id: item.id.videoId,
                        url: `https://youtube.com/watch?v=${item.id.videoId}`,
                        title: item.snippet.title
                    }
                });
                await searchCache.set(`youtube_search_${searchHash}`, actualResult);
                return actualResult;
            } else {
                throw new TranslatableError({t: 'generic.error', message: 'empty search returned!'});
            }
        }
    }

    async searchRequest(search) {
        let res = await axios({
            url: 'https://www.googleapis.com/youtube/v3/search',
            method: 'get',
            params: {
                part: 'snippet',
                type: 'video',
                maxResults: opts.maxResults,
                key: opts.key,
                order: opts.order,
                q: search
            }
        });
        return res.data;
    }

    removeBracket(url) {
        if (url.startsWith('<')) {
            url = url.substr(1);
        }
        if (url.endsWith('>')) {
            url = url.substr(0, url.length - 1);
        }
        return url;
    }
}
module.exports = SongResolver;