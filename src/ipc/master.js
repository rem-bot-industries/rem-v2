/**
 * Created by julia on 24.01.2017.
 */
let EventEmitter = require('eventemitter3');
let uws = require('ws');
let ws_port = require('../../config/main.json').ws_port;
let OPCODE = require('../structures/constants').MESSAGE_TYPES;
let _ = require('lodash');
const config = require('../../config/main.json');
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
let stat = config.beta ? 'rem-beta' : 'rem-live';
class Master extends EventEmitter {
    constructor() {
        super();
        this.wss = new uws.Server({host: 'localhost', port: ws_port, clientTracking: true, noServer: true}, () => {
            this.setupListeners()
        });
        this.shards = {};
    }

    setupListeners() {
        this.wss.on('connection', (ws) => {
            dogstatsd.increment(`${stat}.websocket_connect`);
            this.onConnection(ws);
        });
        this.wss.on('error', (err) => this.onError(err));
    }

    onConnection(ws) {
        ws.on('message', (msg, flags) => this.onMessage(msg, flags, ws));
        ws.on('close', (code, number) => this.onDisconnect(code, number, ws));
        ws.on('error', (err) => this.onError(err));
        ws.send(JSON.stringify({op: OPCODE.identify}));
    }

    onError(err) {
        console.error(err);
    }

    onDisconnect(code, number, ws) {
        console.error(`Disconnect: Code: ${code} Number: ${number}`);
        dogstatsd.increment(`${stat}.websocket_disconnect`);
        _.forEach(this.shards, (shard) => {
            if (shard.ws === ws) {
                clearInterval(this.shards[shard.shardID].interval);
                delete this.shards[shard.shardID];
                console.log(`deleted old shard ${shard.shardID}`);
            }
        });
    }

    onMessage(msg, flags, ws) {
        try {
            msg = JSON.parse(msg);
        } catch (e) {
            console.error(msg);
            return console.error(e);
        }
        dogstatsd.increment(`${stat}.websocket`);
        // console.log(msg);
        switch (msg.op) {
            case OPCODE.identify: {
                // console.log(`Master: ${JSON.stringify(msg)}`);
                ws.send(JSON.stringify({op: OPCODE.ready, hearbeat: 15000}));
                this.shards[msg.shardID] = {
                    identified: true,
                    connected: true,
                    hearbeat: 15000,
                    shardID: msg.shardID,
                    interval: this.setupHearbeat(15000, msg.shardID),
                    ws: ws
                };
                return;
            }
            case OPCODE.ready: {
                return;
            }
            case OPCODE.message: {
                // console.log(`Master: ${JSON.stringify(msg)}`);
                this.emit(msg.d.event, msg.d.data);
                return;
            }
            case OPCODE.hearbeat: {
                ws.send(JSON.stringify({op: OPCODE.hearbeat}));
                if (this.shards[msg.shardID]) {
                    // console.log(`Master: ${JSON.stringify(msg)}`);
                    clearInterval(this.shards[msg.shardID].interval);
                    this.shards[msg.shardID].interval = this.setupHearbeat(this.shards[msg.shardID].hearbeat, msg.shardID);
                }
                return;
            }
            default:
                return console.error(`Unkown Message ${JSON.stringify(msg)}`);
        }
    }

    setupHearbeat(beat, id) {
        return setInterval(() => {
            this.emit('_hearbeat_fail', {shardID: id})
        }, beat);
    }
    broadcast(event, msg) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    op: OPCODE.message, d: {
                        event: event,
                        origin: `master`,
                        data: msg,
                        sendedAt: Date.now()
                    }
                }));
            }
        });

    }
}
module.exports = Master;