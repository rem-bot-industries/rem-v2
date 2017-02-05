/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
let uws = require('ws');
let ws_port = process.env.ws_port;
let ws_host = process.env.ws_hostname;
let OPCODE = require('../structures/constants').MESSAGE_TYPES;
class Worker extends EventEmitter {
    constructor(id) {
        super();
        this.connectionAttempts = 0;
        this.ws = null;
        this.shardId = id;
        this.state = {ready: false, connected: false, hearbeat: -1};
        this.hearbeatInterval = null;
        this.hearbeatTimeout = null;
        this.connect();
    }

    connect() {
        this.ws = new uws(`ws://${ws_host}:${ws_port}`);
        this.ws.on('open', () => {
            this.connectionAttempts = 1;
            this.onConnection();
        });
        this.ws.on('error', (err) => this.onError(err));
        this.ws.on('close', (code, number) => this.onDisconnect(code, number));
    }

    onConnection() {
        this.state.connected = true;
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
        this.state.connected = false;
        this.state.ready = false;
        this.state.hearbeat = -1;
        let time = this.generateInterval(this.connectionAttempts);
        clearInterval(this.hearbeatInterval);
        setTimeout(() => {
            this.connectionAttempts++;
            this.connect();
        }, time);
    }

    reconnect() {
        this.ws.close(8000, 'Reconnect on User Wish!');
    }

    generateInterval(k) {
        let maxInterval = (Math.pow(2, k) - 1) * 1000;

        if (maxInterval > 30 * 1000) {
            maxInterval = 30 * 1000;
        }
        return Math.random() * maxInterval;
    }

    onMessage(msg, flags) {
        try {
            msg = JSON.parse(msg);
        } catch (e) {
            console.error(msg);
            return console.error(e);
        }
        // console.log(msg);
        switch (msg.op) {
            case OPCODE.identify: {
                // console.log(msg);
                this.ws.send(JSON.stringify({op: OPCODE.identify, shardToken: process.env.shard_token}));
                return;
            }
            case OPCODE.ready: {
                // console.log(msg);
                this.state.hearbeat = msg.hearbeat;
                this.state.ready = true;
                this.setupHeartbeat(msg.hearbeat);
                this.emit('ws_ready', (msg.d));
                return;
            }
            case OPCODE.message: {
                this.emit(msg.d.event, msg.d.data);
                return;
            }
            case OPCODE.hearbeat: {
                clearTimeout(this.hearbeatTimeout);
                // console.log(msg);
                return;
            }
            case OPCODE.unauthorized: {
                console.error('The token was not accepted!');
                return;
            }
            default:
                return console.error(`Unkown Message ${JSON.stringify(msg)}`);
        }
    }

    setupHeartbeat(beat) {
        this.hearbeatInterval = setInterval(() => {
            this.ws.send(JSON.stringify({
                op: OPCODE.hearbeat,
                shardID: this.shardId,
                shardToken: process.env.shard_token
            }));
            this.hearbeatTimeout = setTimeout(() => {
                console.error('Master did not respond!');
            }, beat + 5000);
        }, beat - 3000);
    }

    send(event, msg) {
        this.ws.send(JSON.stringify({
            op: OPCODE.message,
            shardToken: process.env.shard_token,
            shardID: this.shardId, d: {
                event: event,
                uwu: 'uwu',
                origin: `worker-${process.pid}-${this.shardId}`,
                data: msg,
                sendedAt: Date.now(),
                shardID: this.shardId
            }
        }));
    }

    emitRemote(event, msg) {
        this.ws.send(JSON.stringify({
            op: OPCODE.message,
            shardToken: process.env.shard_token,
            shardID: this.shardId, d: {
                event: event,
                origin: `worker-${process.pid}
                -${this.shardId}`,
                shardID: this.shardId,
                data: msg,
                sendedAt: Date.now()
            }
        }));
    }
}
module.exports = Worker;