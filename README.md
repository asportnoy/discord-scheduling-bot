# Requirements
* nodejs v12 or later
* mongoDB
* Externally accessible domain for web server (recommended)
* [Discord Bot Application](https://discord.com/developers/applications)
# Setup
1. Download or clone this repository
2. Run `npm run-script build`.
3. Open the config folder. You should see 2 files named `config.json` and `keys.json`. If not, duplicate `config.example.json` and `keys.example.json` and rename them respectively.
4. Set up the config files according to your needs.
5. Start `app.js`. I recommend using a process manager like [pm2](https://pm2.keymetrics.io/) to make sure it's always running.
6. Invite the bot to your server. You can use [this site](https://discordapi.com/permissions.html) to generate an invite link. Scheduler needs permission to read messages, send messages, embed links, and attach files.
# Commands
All commands should start with the prefix set in your config file.
## get [user]
Get the current time for the user specified. If no user is specified, your time will be shown.
## set [zone]
Set your time zone. If you want to use the web setup (if enabled), don't specify a time zone and you will be DMed instructions. Otherwise, specify a [time zone](https://github.com/asportnoy/scheduler/blob/main/zones.md).
## format [format]
Set your time display format. If you don't specify a format, the available ones will be listed.