/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
const winston = require('winston');
var fs = require("fs");
var path = require("path");
var util = require("util");
class CmdManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.commands = {};
        this.ready = false;
    }
    saveSong(song) {

    }
    searchSong(song) {

    }

}
module.exports = CmdManager;