function idFromMention(string) {
    if ((string.startsWith('<@!') || string.startsWith('<@&')) && string.endsWith('>')) return string.slice(3, -1)
    if ((string.startsWith('<@') || string.startsWith('<#')) && string.endsWith('>')) return string.slice(2, -1);
    return string;
}

async function findUser(q, client, guild) {
    let user = null,
        member = null;
    let id = idFromMention(q);

    // ID or mention match
    user = await client.users.fetch(id).catch(e => {});
    if (user) {
        if (guild) member = guild.member(user);
        return {
            user,
            member
        }
    }

    //Username match

    // Separate tag from username if provided
    let username, tag;
    if (q.includes('#')) {
        let split = q.replace(/[@]/g, '').split('#');
        username = split[0];
        tag = split[1];
    } else {
        username = q;
        tag = null;
    }

    // Search for members with the username provided
    let members = await guild.members.fetch({
        query: username,
        limit: 100
    }).catch(e => {});
    
    // No users found
    if (!members || members.size == 0) return {
        user: null,
        member: null
    }

    // Username and tag match
    if (tag) {
        let taggedMember = members.find(x => x.user.username.toLowerCase() == username.toLowerCase() && x.user.discriminator == tag);
        if (taggedMember) return {
            user: taggedMember.user,
            member: taggedMember
        }
        else {
            return {
                user: null,
                member: null
            }
        }
    }
    // Display name matches exactly
    let exactDisplayName = members.filter(x => x.displayName.toLowerCase() == username.toLowerCase());
    if (exactDisplayName.size > 0) return {
        user: exactDisplayName.first().user,
        member: exactDisplayName.first()
    }

    // Username matches exactly
    let exactUsername = members.filter(x => x.user.username.toLowerCase() == username.toLowerCase());
    if (exactUsername.size > 0) return {
        user: exactUsername.first().user,
        member: exactUsername.first()
    }

    // First result recieved
    return {
        user: members.first().user,
        member: members.first()
    }
}

module.exports = {
    idFromMention,
    findUser
};