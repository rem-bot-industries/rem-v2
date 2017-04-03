/**
 * Created by Julian/Wolke on 06.01.2017.
 */
let Song = require('./song.js');
let websocket = require('ws');
class Radio extends Song {
    constructor(options) {
        super(options);
        this.options = options;
        if (this.options.wsUrl) {
            this.connect();
        }
    }

    updateTitle(title) {
        this.title = title;
    }

    connect() {
        this.ws = new websocket(this.options.wsUrl);
        this.ws.on('open', () => {
            this.connectionAttempts = 1;
            this.onConnection();
        });
        this.ws.on('error', (err) => this.onError(err));
        this.ws.on('close', (code, number) => this.onDisconnect(code, number));
    }

    onConnection() {
        this.ws.on('message', (msg, flags) => this.onMessage(msg, flags));
    }

    onError(err) {
        console.error(err);
        console.log(`ws error!`);
        this.reconnect();
    }

    onDisconnect(code, number) {
        console.error(code);
        console.error(number);
    }

    onMessage(msg, flags) {
        // console.log(msg);
        try {
            let actualMessage = JSON.parse(msg);
            if (actualMessage.song_name && actualMessage.artist_name) {
                this.updateTitle(`${actualMessage.artist_name} - ${actualMessage.song_name} (${this.options.radio})`);
            }
        } catch (e) {
            console.error(e);
        }
    }
}
module.exports = Radio;