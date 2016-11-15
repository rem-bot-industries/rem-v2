/**
 * Created by julia on 15.11.2016.
 */
var EventEmitter = require('eventemitter3');
var net = require('net');
class Client extends EventEmitter {
    constructor(ip, port, shardID) {
        super();
        this.ip = ip;
        this.port = port;
        this.sid = shardID;
        this.socket = null;
        this.init();
        this.heartbeatTimer = null;
    }

    init() {
        this.socket = new net.Socket();
        this.socket.connect({port: this.port, host: this.ip});
        this.socket.setEncoding('UTF-8');
        this.socket.on('connect', () => {
            this.connectionHandler()
        });
        this.socket.on('data', (d) => {
            this.dataHandler(d)
        });
        this.socket.on('error', err => console.log(err));
        this.socket.on('close', () => {
            this.reset()
        });
    }

    connectionHandler() {
        console.log('connected to bridge!');
        this.initHeartbeat();
    }

    dataHandler(d) {
        let data;
        try {
            data = JSON.parse(d);
        } catch (e) {
            console.log(`Unparsed Data: ${d}`);
        }
        // console.log(data);
    }

    initHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.heartbeat();
        }, 1000 * 5);
    }

    heartbeat() {
        this.socket.write(JSON.stringify({sid: this.sid, action: 'heartbeat'}));
    }

    reset() {
        clearInterval(this.heartbeatTimer);
        this.socket.end();
        console.log('Trying to reconnect');
        setTimeout(() => {
            this.init();
        }, 10 * 1000)
    }

}
module.exports = Client;