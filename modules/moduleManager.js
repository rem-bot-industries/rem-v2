/**
 * Created by julia on 04.01.2017.
 */
let winston = require('winston');
let async = require('async');
let readDir = require('recursive-readdir');
let path = require("path");
let ModPath = path.join(__dirname, './managed');
class ModuleManager {
    constructor() {
        this.mods = {};
        this.rawMods = {};
    }

    init() {
        let that = this;
        return new Promise(function (resolve, reject) {
            readDir(ModPath, (err, files) => {
                if (err) return winston.error(err);
                // winston.info(files);
                for (let file of files) {
                    try {
                        let mod = require(file);
                        that.loadRawMod(mod);
                    } catch (e) {
                        console.error(`Error while requiring mod ${file}`);
                        console.error(e);
                        console.error(e.stack);
                        return winston.error(e);
                    }
                }
                async.eachSeries(that.rawMods, (mod, cb) => {
                    that.load(mod).then(loadedMod => {
                        //winston.info(`${mod.shortcode} is loaded!`);
                        that.mods[mod.shortcode] = loadedMod;
                        cb();
                    }).catch(err => {
                        return cb(err);
                    });
                }, (err) => {
                    if (err) return console.error(err);
                    winston.info('loaded mods');
                    resolve(that);
                    //winston.info(this.mods);
                });
            });
        });

    }

    loadRawMod(mod) {
        if (this.rawMods[mod.shortcode]) {
            throw new Error(`${mod.shortcode} is already used.`);
        }
        this.rawMods[mod.shortcode] = mod;
    }

    load(mod) {
        //winston.info(mod.shortcode);
        let that = this;
        let protoDep = {mod: this};
        return new Promise(function (resolve, reject) {
            if (that.mods[mod.shortcode]) {
                resolve(that.mods[mod.shortcode]);
            }
            if (mod.deps.length > 0) {
                that.resolveDependencies(mod.deps).then(resolvedDeps => {
                    resolvedDeps['mod'] = that;
                    return that.instantiateMod(mod, resolvedDeps);
                }).then(instantiatedMod => {
                    resolve(instantiatedMod);
                });
            } else {
                if (that.rawMods[mod.shortcode].async) {
                    //winston.info(`Mod ${mod.shortcode} is async`);
                    that.instantiateMod(mod, protoDep).then(instantiatedMod => {
                        resolve(instantiatedMod);
                    });
                } else {
                    that.rawMods[mod.shortcode].ready = true;
                    that.instantiateMod(mod, protoDep).then(instantiatedMod => {
                        resolve(instantiatedMod);
                    });
                }
            }
        })
    }

    instantiateMod(mod, deps) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let modInstance = new mod.class(deps);
            if (mod.async) {
                //winston.info(`Mod ${mod.shortcode} is being init'D`);
                modInstance.init().then(() => {
                    //winston.info(`resolved mod ${mod.shortcode}`);
                    that.mods[mod.shortcode] = modInstance;
                    that.mods[mod.shortcode].ready = true;
                    resolve(modInstance);
                });
            } else {
                //winston.info(`insta resolved mod ${mod.shortcode}`);
                that.mods[mod.shortcode] = modInstance;
                that.mods[mod.shortcode].ready = true;
                resolve(modInstance);
            }
        });

    }

    resolveDependencies(deps) {
        return new Promise((resolve, reject) => {
            let resolvedDeps = {};
            async.each(deps, (dep, cb) => {
                if (this.mods[dep]) {
                    resolvedDeps[dep] = this.mods[dep];
                    cb();
                } else {
                    this.load(this.rawMods[dep]).then(instantiatedMod => {
                        resolvedDeps[dep] = instantiatedMod;
                        cb();
                    }).catch(err => cb(err));
                }
            }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resolvedDeps);
                }
            });
        })
    }

    reload() {

    }

    unload() {

    }

    getMod(mod) {
        return this.mods[mod];
    }
}
module.exports = ModuleManager;