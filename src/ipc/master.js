/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
let uws = require('uws');
class Master extends EventEmitter {
    constructor() {
        super();
        this.wss = new uws.Server({host: 'localhost', port: 8878, clientTracking: true}, () => {
            this.setupListeners()
        });
    }

    setupListeners() {
        this.wss.on('connection', (ws) => {
            this.onConnection(ws)
        });
        this.wss.on('error', (err) => this.onError(err));
    }

    onConnection(ws) {
        ws.on('message', (msg, flags) => this.onMessage(msg, flags));
        ws.on('close', (code, number) => this.onDisconnect(code, number));
        ws.on('error', (err) => this.onError(err));
    }

    onError(err) {
        console.error(err);
    }

    onDisconnect(code, number) {
        console.error(code);
        console.error(number);
    }

    onMessage(msg, flags) {
        try {
            msg = JSON.parse(msg);
        } catch (e) {
            return console.error(e);
        }
        if (msg.uwu !== 'uwu') return;
        this.emit(msg.event, msg.data);
    }

    broadcast(event, msg) {
        this.wss.clients.forEach((client) => {
            if (client !== this.ws && client.readyState === 1) {
                client.send(JSON.stringify({
                    event: event,
                    uwu: 'uwu',
                    origin: `master`,
                    data: msg,
                    sendedAt: Date.now()
                }));
            }
        });

    }
}
module.exports = Master;