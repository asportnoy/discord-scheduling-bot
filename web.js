const {
    port
} = require('./config/config.json');

const {
    User
} = require('./helpers/mongo');

const verifyReasons = {
    'no_token': 'This code is not valid.',
    'invalid_token': 'This code is not valid.',
    'expired': 'This code is expired.',
    'invalid_action': 'This code cannot be used for this.'
}

const Discord = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
dayjs.extend(timezone)


const {
    UserFlags
} = require('discord.js');

module.exports = async (client) => {


    const app = express();
    app.use(cors());
    app.listen(port);
    app.use(bodyParser.json())
    app.use(bodyParser.text())
    app.use(bodyParser.urlencoded({
        extended: true
    }))

    app.use('/src', express.static('src'));

    app.get('/timezone', async (req, res) => {
        const {
            id,
            code
        } = req.query;
        if (!id || !code) return res.status(400).send('ID or code missing from URL.');
        const user = await User.findOne().id(id);
        if (!user) return res.status(400).send('Could not find user.');
        const valid = await user.verifyToken(code, 'timezone');

        const reason = valid.reason ? verifyReasons[valid.reason] : null;

        if (!valid.valid) return res.status(400).send(reason || 'This code is not valid.');

        res.sendFile(__dirname + '/views/pages/timezone.html');
    });

    app.post('/timezone', async (req, res) => {
        const {
            id,
            code
        } = req.query;

        const zone = req.body;

        // Validate code
        if (!id || !code) return res.status(400).send('ID or code missing from URL.');
        const user = await User.findOne().id(id);
        if (!user) return res.status(400).send('Could not find user.');
        const valid = await user.verifyToken(code, 'timezone');
        const reason = valid.reason ? verifyReasons[valid.reason] : null;
        if (!valid.valid) return res.status(400).send(reason || 'This code is not valid.');

        // Time format
        const format = user.getFormat().format;

        // Make sure zone is valid
        if (!zone || typeof zone !== 'string') return res.status(400).send('Invalid zone.');

        // Set zone
        let day;
        try {
            day = dayjs().tz(zone);
        } catch (e) {
            return res.status(400).send('Invalid zone.');
        }

        // Update DB
        await user.clearToken();
        user.timezone = zone;
        await user.save();
        res.status(200).send('Set your timezone.');

        // Notify user
        try {
            const discorduser = await client.users.fetch(id).catch(e => {console.log(e)});
            if (!discorduser) return;
            discorduser.send(new Discord.MessageEmbed({
                author: {
                    name: discorduser.tag,
                    iconURL: discorduser.displayAvatarURL({
                        dynamic: true
                    })
                },
                title: 'Timezone Set',
                description: `Your timezone was set to \`${zone}\`. The current time is **${day.format(format)}**.`,
                timestamp: dayjs()
            })).catch(e => {console.log(e)});
        } catch (e) {
            console.log(e);
        }
    });
}