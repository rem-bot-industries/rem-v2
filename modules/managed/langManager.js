/**
 * Created by julia on 07.11.2016.
 */
let Manager = require('../../structures/manager');
const winston = require('winston');
let fs = require("fs");
let path = require("path");
let util = require("util");
let i18next = require('i18next');
let Backend = require('i18next-node-fs-backend');
class LangManager extends Manager {
    constructor() {
        super();
        this.setMaxListeners(1);
        this.commands = {};
        this.i18next = i18next;
        this.t = null;
        this.list = null;
    }

    init() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.load().then(t => {
                resolve(t);
            }).catch(err => reject(err));
        })
    }

    load() {
        let that = this;
        return new Promise(function (resolve, reject) {
            let backendOptions = {
                loadPath: 'locales/{{lng}}/{{ns}}.json',
                addPath: 'locales/{{lng}}/{{ns}}.missing.json',
                jsonIndent: 2
            };
            that.getDirs('locales/', (list) => {
                that.list = list;
                i18next.use(Backend).init({
                    backend: backendOptions,
                    lng: 'en',
                    fallbacklngs: false,
                    preload: list,
                    load: 'all'
                }, (err, t) => {
                    if (err) {
                        winston.error('Error at i18n' + err);
                        reject(err);
                    } else {
                        that.t = t;
                        resolve(t);
                    }
                });
            });
        });
    }

    getDirs(rootDir, cb) {
        let langPath = path.join(__dirname, `../../${rootDir}`);
        // console.log(langPath);
        fs.readdir(langPath, function (err, files) {
            if (err) {
                winston.error(err);
                return cb(err);
            }
            let dirs = [];
            // console.log(files);
            for (let index = 0; index < files.length; ++index) {
                let file = files[index];
                if (file[0] !== '.') {
                    let filePath = langPath + '/' + file;
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

    getT() {
        return this.t;
    }
}
module.exports = {class: LangManager, deps: [], async: true, shortcode: 'lm'};