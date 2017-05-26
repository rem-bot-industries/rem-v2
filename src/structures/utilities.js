/**
 * Created by Julian on 25.05.2017.
 */
/**
 * Renders a list with the passed array, does not check for maxlength etc.
 * @param contentArray Array of content to render
 * @param [lang] Optionally define a markup language to use
 * @param [block=true] Optionally wrap the content in a text block
 */
const renderList = (contentArray, lang, block = true) => {
    let list = "";
    contentArray.forEach(c => {
        list += c + '\n';
    });
    if (block) {
        list = wrapBlock(list, lang);
    }
    return list;
};
const wrapBlock = (content, lang) => {
    let list = `\`\`\`${lang}\n`;
    list += content;
    list += "```";
    return list;
};
const prefixIndex = (contentArray) => {
    let i = 0;
    return contentArray.map(c => {
        i++;
        return `[${i}] ${c}`;
    });
};
module.exports = {renderList, wrapBlock, prefixIndex};