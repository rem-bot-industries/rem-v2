/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let request = require('request');

// Terms to block from search (not added as hidden tags on the search because
// yandere limits searches to 6 tags, so we remove tags from the query before we
// send it and filter out bad items from the response)
const yandereFilter = [
    'loli', // loli, lolicon
    'shota', // shota, shotacon
    'child' // child, child_porn
];

class Yandere extends Command {
    constructor({t}) {
        super();
        this.cmd = 'yandere';
        this.cat = 'nsfw';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        // Force commands to only run in NSFW channels
        if (!msg.channel.name.startsWith('nsfw')) {
            return msg.channel.createMessage(this.t('nsfw-images.error-discord-not-nsfw-channel', {lngs: msg.lang}));
        }

        let msgSplit = msg.content.split(' ');
        let msgSearch = '';
        let searchOrig = '';
        for (let i = 1; i < msgSplit.length; i++) {
            if (i === 1) {
                searchOrig = msgSplit[i];
            } else {
                searchOrig = searchOrig + ' ' + msgSplit[i];
            }
        }

        // Filter query
        for (let filter of yandereFilter) {
            if (searchOrig.indexOf(filter) > -1) {
                return msg.channel.createMessage(this.t('nsfw-images.error-discord-tos-conflict', {lngs: msg.lang}));
            }
        }

        msgSearch = 'order:score rating:questionableplus ' + searchOrig;
        request.get('https://yande.re/post.json', {
            qs: {
                limit: 200,
                tags: msgSearch
            }
        }, (error, response, body) => {
            if (error) {
                return msg.channel.createMessage(this.t('nsfw-images.error-body', {lngs: msg.lang}));
            }
            if (!error && response.statusCode === 200) {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return msg.channel.createMessage(this.t('nsfw-images.error-body', {lngs: msg.lang}));
                }
                if (typeof body !== 'undefined' && body.length > 0) {
                    // Filter response for bad items
                    body = body.filter(item => {
                        if (typeof item === 'undefined' || typeof item.tags !== 'string') return false;
                        for (let filter of yandereFilter) {
                            if (item.tags.indexOf(filter) > -1) {
                                return false;
                            }
                        }
                        return true;
                    });

                    if (body.length > 0) {
                        let random = Math.floor(Math.random() * body.length);
                        if (typeof(body[random]) !== 'undefined' && typeof (body[random].file_url) !== 'undefined') {
                            msg.channel.createMessage(body[random].file_url);
                        } else {
                            msg.channel.createMessage(this.t('nsfw-images.error-body', {lngs: msg.lang}));
                        }
                        return;
                    }
                }

                msg.channel.createMessage(this.t('nsfw-images.nothing-found', {
                    lngs: msg.lang,
                    tags: searchOrig
                }));
            }
        });
    }
}
module.exports = Yandere;