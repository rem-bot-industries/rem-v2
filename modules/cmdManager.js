/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
const winston = require('winston');
var fs = require("fs");
var path = require("path");
var util = require("util");
class CmdManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.load();
        this.commands = {};
        this.ready = false;
    }

    load() {
        fs.readdir(path.join(__dirname, '../commands'), (err, files) => {
            let commands = {};
            for (let file of files) {
                if (file.endsWith('.js')) {
                    var command = require(path.join(__dirname, '../commands/', file));
                    let cmd = new command('t');
                    console.log(util.inspect(cmd));
                    commands[cmd.cmd] = cmd;
                }
            }
            this.commands = commands;
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
                console.log(command);
                console.log(this.commands);
                this.commands[command].run(msg);
            }
            catch (err) {
                winston.error(err.message);
                // winston.error(err.stack);
            }
        }
    }
}
module.exports = CmdManager;