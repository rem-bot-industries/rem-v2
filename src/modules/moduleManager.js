/**
 * Created by Julian/Wolke on 04.01.2017.
 */
let winston = require('winston');
let async = require('async');
let readDir = require('recursive-readdir');
let path = require('path');
let ModPath = path.join(__dirname, './managed');
/**
 * This is the ModuleManager Class, it loads all modules within managed/ and instantiates them and their dependencies
 */
let start;
class ModuleManager {
    constructor() {
        this.mods = {};
        this.rawMods = {};
    }

    init(hub, Raven, Redis) {
        start = Date.now();
        if (hub) {
            this.mods['hub'] = hub;
        } else {
            winston.warn(`There was no websocket client passed, this means that either sharding is disabled and you can ignore this message or that something went seriously wrong!`);
        }
        if (Raven) {
            this.mods['raven'] = Raven;
        } else {
            winston.warn(`There was no error tracking client passed, this means that either errortracking is disabled and you can ignore this message or that something went seriously wrong!`);
        }
        if (Redis) {
            this.mods['redis'] = Redis;
        } else {
            winston.warn(`There was no redis client passed, this means that either redis is disabled and you can ignore this message or that something went seriously wrong!`);
        }
        let that = this;
        return new Promise(function (resolve, reject) {
            readDir(ModPath, (err, files) => {
                if (err) return winston.error(err);
                // winston.info(files);
                for (let file of files) {
                    if (file.endsWith('.js')) {
                        try {
                            let mod = require(file);
                            that.loadRawMod(mod);
                        } catch (e) {
                            console.error(`Error while requiring mod ${file}`);
                            console.error(e);
                            console.error(e.stack);
                            reject(e);
                        }
                    }
                }
                async.eachSeries(that.rawMods, (mod, cb) => {
                    that.load(mod).then(loadedMod => {
                        that.mods[mod.shortcode] = loadedMod;
                        cb();
                    }).catch(err => {
                        return cb(err);
                    });
                }, (err) => {
                    if (err) return console.error(err);
                    winston.info(`loaded mods in ${Date.now() - start}ms`);
                    resolve(that);
                    //winston.info(this.mods);
                });
            });
        });

    }

    loadRawMod(mod) {
        this.rawMods[mod.shortcode] = mod;
    }

    load(mod) {
        // winston.info(`Loading mod ${mod.shortcode}`);
        let that = this;
        let protoDep = {mod: this};
        return new Promise(function (resolve, reject) {
            if (that.mods[mod.shortcode]) {
                // winston.info(`Mod ${mod.shortcode} is already loaded.`);
                resolve(that.mods[mod.shortcode]);
            } else if (mod.deps.length > 0) {
                that.resolveDependencies(mod.deps).then(resolvedDeps => {
                    resolvedDeps['mod'] = that;
                    return that.instantiateMod(mod, resolvedDeps);
                }).then(instantiatedMod => {
                    resolve(instantiatedMod);
                });
            } else {
                if (that.rawMods[mod.shortcode].async) {
                    // winston.info(`Mod ${mod.shortcode} is async`);
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
        });
    }

    async instantiateMod(mod, deps) {
        let modInstance = new mod.class(deps);
        if (mod.async) {
            // winston.info(`Mod ${mod.shortcode} is being initiated!`);
            await modInstance.init();
            // winston.info(`Instantiated async mod ${mod.shortcode}`);
            this.mods[mod.shortcode] = modInstance;
            this.mods[mod.shortcode].ready = true;
            return Promise.resolve(modInstance);
        } else {
            // winston.info(`Instantiated non async mod ${mod.shortcode}`);
            this.mods[mod.shortcode] = modInstance;
            this.mods[mod.shortcode].ready = true;
            return Promise.resolve(modInstance);
        }

    }

    resolveDependencies(deps) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let resolvedDeps = {};
            async.each(deps, (dep, cb) => {
                if (that.mods[dep]) {
                    // winston.info(`Resolved dependency ${dep} from cache`);
                    resolvedDeps[dep] = that.mods[dep];
                    cb();
                } else {
                    that.load(that.rawMods[dep]).then(instantiatedMod => {
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
        });
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