/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
class Master extends EventEmitter {
    constructor(cluster) {
        super();
        if (!cluster) throw new Error('No cluster given.');
        if (!cluster.isMaster) throw new Error('This process is not master!');
        this.cluster = cluster;
        this.setupListeners();
    }

    setupListeners() {
        this.cluster.on('message', (worker, msg, handle) => {
            this.messageHandler(worker, msg, handle);
        });
    }

    messageHandler(worker, msg) {
        if (msg.uwu !== 'uwu') return;
        this.emit(msg.event, msg.data);
    }

    broadcast(event, msg) {
        Object.keys(this.cluster.workers).forEach((id) => {
            let worker = this.cluster.workers[id];
            worker.send({event: event, uwu: 'uwu', origin: 'master', data: msg, sendedAt: Date.now()});
        });

    }
}
module.exports = Master;