/**
 * Created by Julian on 23.05.2017.
 */
const discordUserReg = /<?(?:#|@|@&|@!)([0-9]+)>/g;
const regs = {user: /<?(?:@|@!)([0-9]+)>/, channel: /<?(?:#)([0-9]+)>/, role: /<?(?:@&)([0-9]+)>/};
const parse = (content, options = {argIndicator: '-', args: {}}) => {
    let contentArray = content.split(' ');
    let res = {};
    let prevMessage = "";
    for (let i = 0; i < contentArray.length; i++) {
        if (contentArray[i].trim().startsWith(options.argIndicator)) {
            if (options.args[contentArray[i].trim().substring(options.argIndicator.length)]) {
                res[contentArray[i].trim().substring(options.argIndicator.length)] = contentArray[i].trim().substring(options.argIndicator.length);
            }
        }

    }
};
module.exports = {parse};