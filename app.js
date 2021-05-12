const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});

const {
    port, domain
} = require('./config/config.json');

const {
    token
} = require('./config/keys.json');

// Start web server
if (port && domain) require('./web')(client);

// Set up Bot handlers
["aliases", "commands", "events", "help"].forEach(x => client[x] = new Discord.Collection());

["info", "time"].forEach(x => require(`./bot/handlers/command`)(client, x)); // Commands
["client"].forEach(x => require(`./bot/handlers/event`)(client, x)); // Events

// Start Discord Bot
client.login(token).catch(e => console.log(`Could not start bot: ${e}`));