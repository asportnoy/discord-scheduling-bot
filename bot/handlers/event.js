const eventDir = `${__dirname}/../events`;
const {
    readdirSync,
    statSync
} = require('fs');

module.exports = async (client, subdirectory) => {
    // Get list of all events
    const events = readdirSync(`${__dirname}/../events/${subdirectory}`);

    // Set up event handler
    for (let path of events) {
        const pull = require(`${__dirname}/../events/${subdirectory}/${path}`);
        const name = path.split('.')[0];
        client.on(name, pull.bind(null, client));
        client.events.set(name, pull.bind(null, client));
    }
}