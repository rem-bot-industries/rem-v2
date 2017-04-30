/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
let websocket = require('ws');
let OPCODE = require('../structures/constants').MESSAGE_TYPES;
class Worker extends EventEmitter {
    constructor(options) {
        super();
        if (!options.connectionUrl) {
            throw new Error('No Connection Url passed!');
        }
        this.options = options;
        this.connectionAttempts = 0;
        this.ws = null;
        this.shardId = null;
        this.shardCount = null;
        this.state = {ready: false, connected: false, hearbeat: -1};
        this.hearbeatInterval = null;
        this.hearbeatTimeout = null;
        this.shardState = 'init';
        this.connect();
    }

    connect() {
        this.ws = new websocket(this.options.connectionUrl);
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
        this.ws.close(4000, 'Reconnect on User Wish!');
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
            case OPCODE.IDENTIFY: {
                // console.log(msg);
                let host = process.env.HOSTNAME ? process.env.HOSTNAME : process.pid;
                let pid = !!process.env.HOSTNAME;
                let message = {
                    op: OPCODE.IDENTIFY,
                    d: {
                        host: host,
                        pid: !pid,
                        token: remConfig.shard_token,
                        sc: this.shardCount,
                        sid: this.shardId,
                        shardState: this.shardState
                    }
                };
                this.ws.send(JSON.stringify(message));
                return;
            }
            case OPCODE.READY: {
                // console.log(msg);
                this.state.hearbeat = msg.d.heartbeat;
                this.state.ready = true;
                clearInterval(this.hearbeatInterval);
                clearTimeout(this.hearbeatTimeout);
                this.setupHeartbeat(msg.d.heartbeat);
                if (this.shardId !== msg.d.sid || this.shardCount !== msg.d.sc) {
                    this.emit('ws_reshard', (msg.d));
                }
                this.shardId = msg.d.sid;
                this.shardCount = msg.d.sc;
                this.emit('ws_ready', (msg.d));
                return;
            }
            case OPCODE.MESSAGE: {
                this.checkAction(msg);
                this.emit('message', msg);
                return;
            }
            case OPCODE.HEARTBEAT: {
                clearTimeout(this.hearbeatTimeout);
                // console.log(msg);
                return;
            }
            default:
                return console.error(`Unknown Message ${JSON.stringify(msg)}`);
        }
    }

    checkAction(msg) {
        switch (msg.d.action) {
            case 'shard_info': {
                if (msg.d.request) {
                    this.emit('action', msg.d);
                } else {
                    this.emit(`action_resolved_${msg.d.actionId}`, msg.d);
                }
                return;
            }
            default: {
                if (!msg.d.actionId) {
                    this.emit(msg.d.action, msg.d.data);
                } else {
                    console.log(`${msg.d.action}_${msg.d.actionId}`);
                    this.emit(`action_resolved_${msg.d.actionId}`, msg.d);
                }
                return;
            }
        }
    }

    setupHeartbeat(beat) {
        this.hearbeatInterval = setInterval(() => {
            try {
                this.ws.send(JSON.stringify({
                    op: OPCODE.HEARTBEAT,
                    shardID: this.shardId,
                    shardToken: remConfig.shard_token
                }));
                this.hearbeatTimeout = setTimeout(() => {
                    console.error('Master did not respond!');
                    this.reconnect();
                }, beat + 5000);
            } catch (e) {
                console.error(e);
                this.reconnect();
            }
        }, beat - 3000);
    }

    send(event, msg) {
        this.ws.send(JSON.stringify({
            op: OPCODE.MESSAGE,
            shardToken: remConfig.shard_token,
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

    updateStats(stats) {
        this.ws.send(JSON.stringify({
            op: OPCODE.STATS_UPDATE,
            shardToken: remConfig.shard_token,
            shardID: this.shardId, d: stats
        }));
    }

    executeAction(action, actionId) {
        this.ws.send(JSON.stringify({
            op: OPCODE.MESSAGE,
            shardToken: remConfig.shard_token,
            d: {
                actionId,
                action: action,
                shardID: this.shardId,
                sendedAt: Date.now()
            }
        }));
    }

    respondAction(event, data) {
        let d = Object.assign({
            actionId: event.actionId,
            action: event.action,
            shardID: this.shardId,
            sendedAt: Date.now()
        }, data);
        this.ws.send(JSON.stringify({
            op: OPCODE.MESSAGE,
            shardToken: remConfig.shard_token,
            d
        }));
    }

    emitRemote(event, msg) {
        this.ws.send(JSON.stringify({
            op: OPCODE.MESSAGE,
            shardToken: remConfig.shard_token,
            shardID: this.shardId, d: {
                event: event,
                action: msg.action,
                origin: `worker-${process.pid}
                -${this.shardId}`,
                shardID: this.shardId,
                data: msg,
                sendedAt: Date.now()
            }
        }));
    }

    updateState(state) {
        this.ws.send(JSON.stringify({
            op: OPCODE.STATE_UPDATE, shardToken: remConfig.shard_token,
            shardID: this.shardId, d: {state}
        }));
        this.shardState = state;
    }

    processMessage(msg) {
        // console.log(msg);
        switch (msg.d.action) {
            case 'updateState':
                this.updateState(msg.d.d.state);
                break;
            case 'updateStats':
                this.updateStats(msg.d.d);
                break;
            case 'executeAction':
                this.executeAction(msg.d.d.action, msg.d.d.actionId);
                break;
            case 'respondAction':
                this.respondAction(msg.d.d.event, msg.d.d.data);
                break;
            default:
                break;
        }
    }
}
module.exports = Worker;