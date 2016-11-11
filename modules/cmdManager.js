/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
const winston = require('winston');
var fs = require("fs");
var path = require("path");
var util = require("util");
class CmdManager extends EventEmitter {
    constructor(l, v) {
        super();
        this.setMaxListeners(20);
        this.l = l;
        this.v = v;
        this.l.on('ready', (t) => this.load(t,this.v));
        this.commands = {};
        this.ready = false;
    }

    load(t,v) {
        fs.readdir(path.join(__dirname, '../commands'), (err, files) => {
            let commands = {};
            for (let file of files) {
                if (file.endsWith('.js')) {
                    var command = require(path.join(__dirname, '../commands/', file));
                    let cmd = new command(t,v);
                    commands[cmd.cmd] = cmd;
                }
            }
            this.commands = commands;
            console.log(util.inspect(this.commands));
            this.emit('ready', commands);
            this.ready = true;
        });
    }

    reload() {

    }

    unload() {

    }

    check(msg) {
        if (this.ready && msg.content.startsWith('!w.')) {
            try {
                let command = msg.content.substr('!w.'.length).split(' ')[0];
                this.commands[command].run(msg);
            }
            catch (err) {
                winston.error(err.message);
                winston.error(err.stack);
            }
        }
    }
    loadServer(msg) {

    }
}
module.exports = CmdManager;