/**
 * Created by julia on 01.11.2016.
 */
const {Command} = require('discord.js-commando');
class PizzaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pizza',
            memberName:'pizza',
            group: 'general',
            description: 'That is so complicated',
            format: '',
            details: 'Rip me',
            examples: ['pizza'],
            guildOnly: false
        });
    }

    async run(msg) {
        var start = Date.now();
        msg.channel.sendMessage("pong").then(sendedMessage => {
            var stop = Date.now();
            var diff = (stop - start);
            sendedMessage.edit(`pong \`${diff}ms\``);
        });
    }

}