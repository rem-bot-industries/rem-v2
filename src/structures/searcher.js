const Menu = require('./menu');
const utils = require('./utilities');
async function userSearchMenu(msg, messageSplit, t) {
    let users = utils.searchUser(msg.channel.guild.members, messageSplit.join(' '));
    if (users.length === 1) {
        return 0;
    }
    if (users.length === 0) {
        return -2;
    }
    let usersList = utils.getMemberListWithNick(users);
    return new Menu(t('search.user', {lngs: msg.lang}), t('menu.guide', {lngs: msg.lang}), usersList.slice(0, 10), t, msg);
}
async function channelSearchMenu(msg, messageSplit, t) {
    let channels = utils.searchChannel(msg.channel.guild.channels, messageSplit.join(' '));
    if (channels.length === 1) {
        return 0;
    }
    if (channels.length === 0) {
        return -2;
    }
    let channelList = utils.getChannelList(channels);
    return new Menu(t('search.channel', {lngs: msg.lang}), t('menu.guide', {lngs: msg.lang}), channelList.slice(0, 10), t, msg);
}
async function roleSearchMenu(msg, messageSplit, t) {
    let roles = utils.searchRoles(msg.channel.guild.roles, messageSplit.join(' '));
    if (roles.length === 1) {
        return 0;
    }
    if (roles.length === 0) {
        return -2;
    }
    let roleList = utils.getRoleList(roles);
    return new Menu(t('search.role', {lngs: msg.lang}), t('menu.guide', {lngs: msg.lang}), roleList.slice(0, 10), t, msg);
}
module.exports = {userSearchMenu, channelSearchMenu, roleSearchMenu};
