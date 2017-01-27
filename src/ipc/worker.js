/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
class Worker extends EventEmitter {
    constructor(cluster) {
        super();
        if (!cluster) throw new Error('No cluster given.');
        if (!cluster.isWorker) throw new Error('This process is not a worker!');
        this.cluster = cluster;
        this.setupListener();
    }

    setupListener() {
        process.on('message', (msg) => {
            this.messageHandler(msg);
        });
    }

    messageHandler(msg) {
        if (msg.uwu !== 'uwu') return;
        this.emit(msg.event, msg.data);
    }

    send(event, msg) {
        process.send({
            event: event,
            uwu: 'uwu',
            origin: `worker-${process.pid}-${this.cluster.worker.id}`,
            data: msg,
            sendedAt: Date.now()
        });
    }

    emitRemote(event, msg) {
        process.send({
            event: event,
            uwu: 'uwu',
            origin: `worker-${process.pid}-${this.cluster.worker.id}`,
            data: msg,
            sendedAt: Date.now()
        });
    }
}
module.exports = Worker;