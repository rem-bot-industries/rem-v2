/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
let uws = require('uws');
class Worker extends EventEmitter {
    constructor(cluster) {
        super();
        if (!cluster) throw new Error('No cluster given.');
        if (!cluster.isWorker) throw new Error('This process is not a worker!');
        this.cluster = cluster;
        this.ws = new uws('ws://127.0.0.1:8878');
        this.ws.on('open', () => {
            this.onConnection();
        });
    }

    onConnection() {
        this.ws.on('message', (msg, flags) => this.onMessage(msg, flags));
        this.ws.on('close', (code, number) => this.onDisconnect(code, number));
        this.ws.on('error', (err) => this.onError(err));
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

    send(event, msg) {
        this.ws.send(JSON.stringify({
            event: event,
            uwu: 'uwu',
            origin: `worker-${process.pid}-${this.cluster.worker.id}`,
            data: msg,
            sendedAt: Date.now()
        }));
    }

    emitRemote(event, msg) {
        this.ws.send(JSON.stringify({
            event: event,
            uwu: 'uwu',
            origin: `worker-${process.pid}-${this.cluster.worker.id}`,
            data: msg,
            sendedAt: Date.now()
        }));
    }
}
module.exports = Worker;