/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
const winston = require('winston');
let fs = require("fs");
let path = require("path");
let util = require("util");
let i18next = require('i18next');
let Backend = require('i18next-node-fs-backend');
class LangManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.load();
        this.commands = {};
        this.i18next = i18next;
        this.t = null;
        this.list = null;
    }

    load() {
        let backendOptions = {
            loadPath: 'locales/{{lng}}/{{ns}}.json',
            addPath: 'locales/{{lng}}/{{ns}}.missing.json',
            jsonIndent: 2
        };
        this.getDirs('locales/', (list) => {
            this.list = list;
            i18next.use(Backend).init({
                backend: backendOptions,
                lng: 'en',
                fallbacklngs: false,
                preload: list,
                load: 'all'
            }, (err, t) => {
                if (err) {
                    return winston.error('Error at i18n' + err);
                }
                this.t = t;
                this.emit('ready', t);
            });
        });
    }

    getDirs(rootDir, cb) {
        fs.readdir(rootDir, function (err, files) {
            let dirs = [];
            for (let index = 0; index < files.length; ++index) {
                let file = files[index];
                if (file[0] !== '.') {
                    let filePath = rootDir + '/' + file;
                    fs.stat(filePath, function (err, stat) {
                        if (stat.isDirectory()) {
                            dirs.push(this.file);
                        }
                        if (files.length === (this.index + 1)) {
                            return cb(dirs);
                        }
                    }.bind({index: index, file: file}));
                }
            }
        });
    }
}
module.exports = LangManager;