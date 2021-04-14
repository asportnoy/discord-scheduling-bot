const Discord = require('discord.js');
const split = require('argv-split');
const {prefix} = require('../../../config/config.json');

module.exports = async (client, msg) => {
    const {content} = msg;

    if (content.startsWith(prefix)) {
        const args = split(content.slice(prefix.length));
        let command = args.shift();

        if (client.aliases.get(command)) command = client.aliases.get(command);
        const handler = client.commands.get(command);
        if (handler) handler.run(msg, command, args);
    }
};