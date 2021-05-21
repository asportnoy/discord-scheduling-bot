const Discord = require('discord.js');

const {
    User
} = require('../../../helpers/mongo');

const {
    findUser,
    idFromMention
} = require('../../../helpers/discord');

const {
    prefix
} = require('../../../config/config.json');

const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
dayjs.extend(timezone)

const formats = [{
        name: '12 hour',
        format: 'h:mm A',
        example: '5:30 PM',
        key: '12',
        aliases: ['12h']
    },
    {
        name: '24 hour',
        format: 'HH:mm',
        example: '17:30',
        key: '24',
        aliases: ['24h']
    }
];

const formatList = formats.map(x => ({
    name: x.name,
    value: `Code: \`${x.key}\`\nExample: \`${x.example}\``,
    inline: true
}))

module.exports.run = async (msg, command, args) => {
    const {
        author,
        channel,
        client,
        guild
    } = msg;

    // Get user from database and create if doesn't exist
    let user = await User.findOne().id(author.id);
    if (!user) {
        user = await new User({
            id: author.id
        }).save();
    }

    const currentFormat = user.getFormat();

    // Set format if provided
    if (args[0]) {
        // Get format argument in lowercase
        const code = args[0].toLowerCase();

        // Find a format mathing the code provided
        const format = formats.find(x => x.key == code || x.aliases.includes(code));

        // If the format exists
        if (format) {
            // Set in DB
            await user.setFormat(format.name, format.format);

            // Send message
            return channel.send(new Discord.MessageEmbed({
                author: {
                    name: author.tag,
                    iconURL: author.displayAvatarURL({
                        dynamic: true
                    })
                },
                name: 'Time format set',
                description: `Your time format was set to \`${format.name}\`.`
            })).catch(e => {});
        }
    }

    // Send current format and options list
    channel.send(new Discord.MessageEmbed({
        author: {
            name: author.tag,
            iconURL: author.displayAvatarURL({
                dynamic: true
            })
        },
        name: 'Time format',
        description: `Your time format is currently set to ${currentFormat.name}.\n\nTo set your format, use \`${prefix}${command} [format]\` with one of the available codes below:`,
        fields: formatList
    })).catch(e => {});
}

module.exports.config = {
    name: 'format',
    aliases: [],
    help: {
        description: 'Set your time display format',
        args: [{
            name: 'code',
            type: 'string',
            required: false
        }],
        examples: ['format', 'format 12h']
    }
};