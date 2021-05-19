# Requirements
* nodejs v12 or later
* mongoDB
* Externally accessible port for web server (recommended)
* [Discord Bot Application](https://discord.com/developers/applications)
# Setup
1. Download or clone this repository
2. Run `npm run-script build`.
3. Open the config folder. You should see 2 files named `config.json` and `keys.json`. If not, duplicate `config.example.json` and `keys.example.json` and rename them respectively.
4. Set up the config files according to your needs.
5. Start `app.js`. I recommend using a process manager like [pm2](https://pm2.keymetrics.io/) to make sure it's always running.
6. Invite the bot to your server. You can use [this site](https://discordapi.com/permissions.html) to generate an invite link. Scheduler needs permission to read messages, send messages, embed links, and attach files.