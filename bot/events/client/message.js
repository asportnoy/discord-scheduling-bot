const Discord = require('discord.js');
const split = require('argv-split');
const {
    prefix
} = require('../../../config/config.json');
const {
    User
} = require('../../../helpers/mongo');
const {
    extractDates
} = require('../../../helpers/time');
const {
    getFullStructure
} = require('../../../helpers/discord');
const dayjs = require('dayjs');

module.exports = async (client, msg) => {
    // Handle partials
    try {
        msg = await getFullStructure(msg);
    } catch(e) {
        return;
    }

    const {
        content,
        channel,
        author,
        guild
    } = msg;

    const {
        bot
    } = author;

    // No DMs and no bots
    if (!guild) return;
    if (bot) return;


    // Is a command
    if (content.startsWith(prefix)) {
        const args = split(content.slice(prefix.length)); // Get args from string
        let command = args.shift(); // Get command from args

        if (client.aliases.get(command)) command = client.aliases.get(command); // Resolve alias to original name
        const handler = client.commands.get(command); // Get command file
        if (handler) handler.run(msg, command, args); // Run if exists
        return;
    }

    // Check if there is a date in the message
    const dates = extractDates(content);
    if (dates && dates.length > 0) { // Date present
        const authorUser = await User.findOne().id(author.id); // Check if author has timezone set
        if (!authorUser || !authorUser.timezone) return;
        msg.react('⏰').catch(e => {}); // React for time conversion
    }
};