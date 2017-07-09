/**
 * Created by Julian on 23.05.2017.
 */
let minimist = require('minimist');
const parse = (messageSplit, options = {}) => {
    messageSplit = messageSplit.filter(m => {
        return m.trim() !== '';
    });
    messageSplit = messageSplit.map(m => m.trim());
    return minimist(messageSplit, options);
};
//args = {a:{type:string}, b:{type:discordUser}}
//!w.ap permission.* true
module.exports = {parse};