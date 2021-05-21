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

module.exports = async (client, reaction, user) => {
    // Handle partials
    try {
        reaction = await getFullStructure(reaction);
        user = await getFullStructure(user);
    } catch (e) {
        return;
    }

    // Check if it's the right emoji
    if (reaction.emoji.name !== '⏰') return;

    const {
        message
    } = reaction;
    const {
        author,
        content,
        channel,
        guild
    } = message;

    // No DMs and no bots
    if (user.bot) return;
    if (!guild) return;

    const dates = extractDates(content); // Get dates from content
    if (dates && dates.length > 0) { // There is at least one date

        // Get timezones for the reacting user and message author
        const authorUser = await User.findOne().id(author.id);
        const reactionUser = await User.findOne().id(user.id);
        if (!authorUser || !authorUser.timezone) return user.send(`We could not get ${author.username}'s time.`).catch(e => {});
        if (!reactionUser || !reactionUser.timezone) return user.send(`You do not have a time zone set.`).catch(e => {});

        // Time format
        const format = authorUser.getFormat().format;

        const authorTime = dayjs().tz(authorUser.timezone);
        const userTime = dayjs().tz(reactionUser.timezone);

        dates.forEach(x => { // Make the dates parse in the author's time zone
            x.start.imply('timezoneOffset', authorTime.utcOffset());
            if (x.end) x.end.imply('timezoneOffset', authorTime.utcOffset());
        })

        // Extract the dates
        const parsed = dates.map(x => ({
            text: x.text,
            start: x.start ? dayjs(x.start.date()) : null,
            end: x.end ? dayjs(x.end.date()) : null,
        }));

        //  Convert to reacting user time zone and format as string
        const converted = parsed.map(x => {
            if (x.start) x.start = x.start.tz(reactionUser.timezone);
            if (x.end) x.end = x.end.tz(reactionUser.timezone);
            if (x.start) x.startText = x.start.format(format);
            if (x.end) x.endText = x.end.format(format);
            return x;
        });

        // Combine converted data into strings
        const result = converted.map(x => ({
            string: x.text,
            converted: x.end ? `${x.startText} - ${x.endText}` : `${x.startText}`
        }));

        // Get the time change between the users
        const zoneOffset = authorTime.utcOffset() - userTime.utcOffset(); // Change in minutes
        const sameTime = zoneOffset == 0; // If there is no time change
        const ahead = zoneOffset > 0; // Is the author ahead of your time
        const hours = Math.floor(Math.abs(zoneOffset) / 60); // Get hour number
        const hourString = `${hours} ${hours == 1 ? 'hour' : 'hours'}`; // Format hour number as text
        const minutes = Math.abs(zoneOffset) % 60; // Get minute number
        const minuteString = `${minutes} ${minutes == 1 ? 'minute' : 'minutes'}`; // Format minute number as text
        // Combine the strings
        // If no time change, say no change
        // Otherwise, show hour change
        // If there is a minute change, show it
        const changeString = sameTime ? `the same as your time` : `${hourString}${minutes == 0 ? ' ' : ` and ${minuteString} `}${ahead ? 'ahead of' : 'behind'} your time`;

        // Send the reacting user a DM
        user.send(new Discord.MessageEmbed({
            author: {
                name: author.tag,
                iconURL: author.displayAvatarURL({
                    dynamic: true
                })
            },
            title: 'Timezone Conversion',
            // Time zone names, time difference, author time
            description: `${authorUser.timezone} ➡️ ${reactionUser.timezone}\n\n${author.username}'s time is ${changeString} (currently ${authorTime.format(format)}).`,
            fields: result.map(x => ({ // Turn the times into fields
                name: x.string,
                value: x.converted
            })).slice(0, 10) //Only take 1st 10
        })).catch(e => {});
    }
}