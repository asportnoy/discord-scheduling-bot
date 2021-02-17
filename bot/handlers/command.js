const commandDir = `${__dirname}/../commands`;

const {
    readdirSync
} = require('fs');

module.exports = async (client, subdirectory) => {
    // Get list of all commands
    const commands = readdirSync(`${__dirname}/../commands/${subdirectory}`);

    // Set up command handler
    for (let path of commands) {
        const pull = require(`${__dirname}/../commands/${subdirectory}/${path}`);
        client.help.set(pull.config.name, pull.config.help);
        client.commands.set(pull.config.name, pull);
        if (pull.config.aliases) pull.config.aliases.forEach(a => client.aliases.set(a, pull.config.name));
    }
}