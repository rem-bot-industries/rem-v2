/**
 * Created by julia on 01.11.2016.
 */
const {Command} = require('discord.js-commando');
class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'general',
            description: 'That is so complicated',
            format: '',
            details: 'Rip me',
            examples: ['ping', 'areyouevenonline'],
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