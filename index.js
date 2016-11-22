const cluster = require('cluster');
const winston = require('winston');
const winstonCluster = require('winston-cluster');
const config = require('./config/main.json');
var StatTrack = require('./modules/statTrack');
require('longjohn');
require('winston-daily-rotate-file');
var util = require("util");
const numCPUs = require('os').cpus().length;
var Shard = require('./shard');
var responses = 0;
var users = 0;
var guilds = 0;
if (cluster.isMaster) {
    var tracker = new StatTrack(20);
    var resp = [];
    tracker.on('fetch', () => {
        console.log('fetch');
        broadcast({type: 'stats'});
    });
    var workers = [];
    process.on('SIGINT', () => {
        console.log('Received SIGINT');
        process.exit(0);
    });
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    winston.add(winston.transports.DailyRotateFile, {
        'timestamp': true,
        'datePattern': '.yyyy-MM-dd',
        'filename': 'logs/rem.log'
    });
    for (var i = 0; i < config.shards; i++) {
        let worker = cluster.fork({id: i, count: config.shards});
        let workerobject = {worker: worker, shard_id: i, pid: worker.process.pid};
        workers.push(workerobject)
    }
    cluster.on('message', handleMessage);
    // winstonCluster.bindListeners();
    winston.info('Spawned Shards!');
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        restartWorker(worker.process.pid);
    });
    function restartWorker(pid) {
        for (var i = 0; i < workers.length; i++) {
            if (pid === workers[i].pid) {
                let index = workers.indexOf(workers[i]);
                if (index > -1) {
                    spawnWorker({id: workers[i].shard_id, count: config.shards});
                    workers.splice(index, 1);
                }
            }
        }
    }

    function spawnWorker(env) {
        // console.log('Spawned new Worker!');
        let worker = cluster.fork(env);
        let workerobject = {worker: worker, shard_id: env.id, pid: worker.process.pid};
        workers.push(workerobject);
        // worker.on('online', () => {
        //     console.log('Worker is online!');
        // });
        // winstonCluster.bindListeners();
    }

    function handleMessage(worker, message, handle) {
        if (message.type === 'stats') {
            resp.push(message);
            responses += 1;
            if (responses === config.shards) {
                users = 0;
                guilds = 0;
                responses = 0;
                for (var i = 0; i < resp.length; i++) {
                    users += resp[i].d.users;
                    guilds += resp[i].d.guilds;
                }
                console.log(`Final Users: ${users} Guilds:${guilds}`);
            }
        }
    }

    function broadcast(msg) {
        for (var i = 0; i < workers.length; i++) {
            workers[i].worker.send(msg);
        }
    }
} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    // winstonCluster.bindTransport();
    let client = new Shard(process.env.id, process.env.count);
    winston.info("Worker started!");

}
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`)
});
winston.cli();