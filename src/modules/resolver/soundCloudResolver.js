/**
 * Created by Julian/Wolke on 08.11.2016.
 */
let BasicImporter = require('../../structures/basicImporter');
const types = require('../../structures/constants').SONG_TYPES;
const Song = require('../../structures/song');
let axios = require('axios');
let regex = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
class SoundcloudImporter extends BasicImporter {
    constructor() {
        super();
    }

    canResolve(url) {
        return regex.test(url);
    }

    async resolve(url) {
        let req = await axios.get('https://api.soundcloud.com/resolve.json', {
            params: {
                url: url,
                client_id: remConfig.soundcloud_key
            }
        });
        let req2 = await axios.get(`https://api.soundcloud.com/i1/tracks/${req.data.id}/streams`, {params: {client_id: remConfig.soundcloud_key}});
        for (let format in req2.data) {
            if (req2.data.hasOwnProperty(format)) {
                if (format.indexOf('http') > -1) {
                    // console.log(req.data);
                    return new Song({
                        id: req.data.id,
                        type: types.soundcloud,
                        title: req.data.title,
                        needsResolve: false,
                        url: url,
                        needsYtdl: true,
                        duration: this.convertDuration({length_seconds: req.data.duration / 1000}),
                        streamUrl: req2.data[format]
                    });
                }
            }
        }
        throw new Error('No suitable format found!');
    }
}
module.exports = new SoundcloudImporter();