/**
 * Created by julia on 17.12.2016.
 */
let Reaction = require('../../DB/reaction');
let Manager = require('../../structures/manager');
let reactions = [
    // {id: '208911955140804608', guildId: '208911955140804608', trigger: '/o/', response: '\\o\\', type: 'exact'},
    // {
    //     id: '208911955140804608',
    //     guildId: '208911955140804608',
    //     trigger: 'uwu',
    //     response: '*uwus with **%USER%***',
    //     type: 'exact'
    // },
    // {
    //     id: '208911955140804608',
    //     guildId: '208911955140804608',
    //     regex: /test/ig,
    //     trigger: '',
    //     response: 'you want to test?',
    //     type: 'regex'
    // }
];
class ReactionManager extends Manager {
    constructor() {
        super();
    }

    addReaction() {

    }

    getReaction(msg) {

    }

    getReactionList(id) {

    }

    removeReaction(guildId, reactionId) {

    }

    filterReaction(msg) {
        for (let i = 0; i < reactions.length; i++) {
            if (reactions[i].guildId === msg.guild.id) {
                if (reactions[i].type === 'exact') {
                    if (msg.content === reactions[i].trigger) {
                        msg.channel.createMessage(this.replaceVars(msg, reactions[i].response));
                    }
                } else {
                    if (reactions[i].regex.test(msg.content)) {
                        console.log(reactions[i].regex);
                        msg.channel.createMessage(this.replaceVars(msg, reactions[i].response));
                    }
                }
            }
        }
    }

    replaceVars(msg, reaction) {
        return reaction.replace('%USER%', msg.author.username).replace('%GUILD%', msg.guild.name);
    }
}
module.exports = {class: ReactionManager, deps: [], async: false, shortcode: 'rm'};