/***
 * Created by julia on 01.11.2016.
 */
let request = require('request');
const config = require('../config/main.json');
let EventEmitter = require('eventemitter3');
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
let stat = config.beta ? 'rem-beta' : 'rem-live';
/**
 * The stattrack engine
 * @extends EventEmitter
 *
 */
class StatTrack extends EventEmitter {
    /**
     * Create the stats engine.
     * @param {number} interval - the interval in seconds until the next update should be triggered
     */
    constructor(interval) {
        super();
        this.setMaxListeners(20);
        this.interval = setInterval(() => {
            this.emit('fetch');
        }, interval * 1000)
    }

    /**
     * Updates the stats on carbonitex and bots.discord.pw
     */
    update(guilds, users) {
        dogstatsd.gauge(`${stat}.guilds`, guilds);
        dogstatsd.gauge(`${stat}.users`, users);
        let requestOptions = {
            headers: {
                Authorization: config.discord_bots_token
            },
            url: `https://bots.discord.pw/api/bots/${config.bot_id}/stats`,
            method: 'POST',
            json: {
                'server_count': guilds
            }
        };
        request(requestOptions, (err, response, body) => {
            if (err) {
                return this.emit('error', err);
            }
            this.emit('info', 'Stats Updated!');
            this.emit('info', body);
        });
        if (!config.beta) {
            let requestOptionsCarbon = {
                url: 'https://www.carbonitex.net/discord/data/botdata.php',
                method: 'POST',
                json: {
                    'server_count': guilds,
                    'key': config.carbon_token
                }
            };
            request(requestOptionsCarbon, (err, response, body) => {
                if (err) {
                    return this.emit('error', err)
                }
                this.emit('info', 'Stats Updated Carbon!');
                this.emit('info', body);
            });
        }

    }
}
module.exports = StatTrack;