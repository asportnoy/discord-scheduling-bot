const Discord = require('discord.js');
const client = new Discord.Client();

const {token} = require('./config/keys.json');

// Start web server
require('./web')(client);

// Set up Bot handlers
["aliases", "commands", "events", "help"].forEach(x => client[x] = new Discord.Collection());

["info", "time"].forEach(x => require(`./bot/handlers/command`)(client, x)); // Commands
["client"].forEach(x => require(`./bot/handlers/event`)(client, x)); // Events

// Start Discord Bot
client.login(token).catch(e => console.log(`Could not start bot: ${e}`));