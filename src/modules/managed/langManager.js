/**
 * Created by Julian/Wolke on 07.11.2016.
 *
 */
let Manager = require('../../structures/manager');
const winston = require('winston');
let fs = require('fs');
let path = require('path');
let util = require('util');
let i18next = require('i18next');
Promise.promisifyAll(fs);
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

    async init() {
        return this.load();
    }

    async load() {
        let that = this;
        let backendOptions = {
            loadPath: '../rem_translate/{{lng}}/{{ns}}.json',
            addPath: '../rem_translate/{{lng}}/{{ns}}.missing.json',
            jsonIndent: 2
        };
        let dirs = await this.getDirs('rem_translate/');
        this.list = dirs;
        return new Promise(function (resolve, reject) {
            i18next.use(Backend).init({
                backend: backendOptions,
                lng: 'en',
                fallbacklngs: false,
                preload: dirs,
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
    }

    async getDirs(rootDir) {
        let langPath = path.join(__dirname, `../../../${rootDir}`);
        // console.log(langPath);
        let files = await fs.readdirAsync(langPath);
        // if (err) {
        //     winston.error(err);
        //     return cb(err);
        // }
        let dirs = [];
        // console.log(files);
        for (let index = 0; index < files.length; ++index) {
            let file = files[index];
            if (file[0] !== '.') {
                let filePath = langPath + '/' + file;
                let stat = await fs.statAsync(filePath);
                if (stat.isDirectory()) {
                    dirs.push(this.file);
                }
                if (files.length === (this.index + 1)) {
                    return Promise.resolve(dirs);
                }
            }
        }
    }

    getT() {
        return this.t;
    }

    getList() {
        return this.list();
    }

    reload() {
        this.i18next.reloadResources();
        this.i18next.on('loaded', () => {
            console.log('reloaded!');
        });
        this.i18next.on('failedLoading', () => {
            console.log('failed reload!');
        })

    }
}
module.exports = {class: LangManager, deps: [], async: true, shortcode: 'lm'};