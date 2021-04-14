const Discord = require('discord.js');

const {
    User
} = require('../../../helpers/mongo');

const {
    findUser,
    idFromMention
} = require('../../../helpers/discord');

const {
    domain
} = require('../../../config/config.json');

const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
dayjs.extend(timezone)

module.exports.run = async (msg, command, args) => {
    const {
        author,
        channel,
        client,
        guild
    } = msg;
    
    // Use current user if none provided
    let q = args.join(' ') || author.id;

    // Find a user matching the query
    let user = await findUser(q, client, guild);
    if (user) user = user.user;

    // Check if a user was returned
    if (!user) return channel.send(`This user does not exist.`).catch(e => {});

    // Find the user in the database and check if they have a timezone set
    let target = await User.findOne().id(user.id);
    if (!target || !target.timezone) return channel.send(`${user.tag} has not set a timezone.`).catch(e => {});


    try {
        // Get their local time
        let time = dayjs().tz(target.timezone).format('h:mm A');
        
        // Display it
        return channel.send(`${user.tag}'s current time is **${time}** (\`${target.timezone}\`).`).catch(e => {});
    } catch (e) {
        return channel.send(`Could not get ${user.tag}'s time: invalid timezone.`).catch(e => {});
    }
}

module.exports.config = {
    name: 'get',
    aliases: [],
    help: {
        description: 'Get someone\'s timezone',
        args: [{
            name: 'user',
            type: 'user',
            required: false
        }],
        examples: ['get']
    }
}