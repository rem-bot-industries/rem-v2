/**
 * Created by Julian on 25.05.2017.
 */
/**
 * Renders a list with the passed array, does not check for maxlength etc.
 * @param contentArray Array of content to render
 * @param [lang] Optionally define a markup language to use
 * @param [block=true] Optionally wrap the content in a text block
 */
const renderList = (contentArray, lang = '', block = true) => {
    let list = "";
    contentArray.forEach(c => {
        list += c + '\n';
    });
    if (block) {
        list = wrapBlock(list, lang);
    }
    return list;
};
/**
 * Wraps a string in a text block and adds syntax highlighting optionally
 * @param content
 * @param lang
 * @returns {string}
 */
const wrapBlock = (content, lang = '') => {
    let list = `\`\`\`${lang}\n`;
    list += content;
    list += "```";
    return list;
};
/**
 * Prefixes every item in a string array with it's index in square brackets
 * @param contentArray Array of strings that should get prefixed
 */
const prefixIndex = (contentArray) => {
    let i = 0;
    return contentArray.map(c => {
        i++;
        return `[${i}] ${c}`;
    });
};
const searchUser = (memberCollection, username) => {
    return memberCollection.filter((m => {
        if (m.nick) {
            if (m.nick.toLocaleLowerCase().indexOf(username.toLocaleLowerCase()) > -1) {
                return true;
            }
        }
        return m.user.username.toLocaleLowerCase().indexOf(username.toLocaleLowerCase()) > -1;
    }));
};
const searchChannel = (channelCollection, channelName) => {
    return channelCollection.filter((m => {
        return m.name.toLocaleLowerCase().indexOf(channelName.toLocaleLowerCase()) > -1;
    }))
};
const searchRoles = (roleCollection, roleName) => {
    return roleCollection.filter(r => {
        return r.name.toLocaleLowerCase().indexOf(roleName.toLocaleLowerCase()) > -1;
    })
};
const getChannelList = (channelArray) => {
    return channelArray.map(c => c.name);
};
const getRoleList = (roleArray) => {
    return roleArray.map(r => r.name);
};
const getMemberListWithNick = (memberArray) => {
    return memberArray.map(m => {
        return `${m.user.username}#${m.user.discriminator}` + (m.nick ? `(${m.nick})` : '');
    });
};
const getCategoriesFromCommands = (commands, addHidden = false) => {
    let categories = {};
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            let command = commands[key];
            if (addHidden || !addHidden && !command.hidden) {
                if (!categories[command.cat]) {
                    categories[command.cat] = [command];
                } else {
                    categories[command.cat].push(command);
                }
            }
        }
    }
    return categories;
};
const getHighestRolePosition = (member, roles) => {
    let resolvedRoles = [];
    member.roles.forEach(roleID => {
        let role = roles.find(r => r.id === roleID);
        if (role) {
            resolvedRoles.push(role);
        }
    });
    resolvedRoles = resolvedRoles.sort((a, b) => {
        return b.position - a.position
    });
    if (resolvedRoles.length > 0) {
        return resolvedRoles[0].position;
    } else {
        return 0;
    }
};
module.exports = {
    searchUser,
    searchRoles,
    searchChannel,
    renderList,
    wrapBlock,
    prefixIndex,
    getMemberListWithNick,
    getChannelList,
    getRoleList,
    getCategoriesFromCommands,
    getHighestRolePosition
};