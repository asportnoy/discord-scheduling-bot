const mongoose = require('mongoose');
const keys = require('../config/keys.json');
const crypto = require('crypto');
const dayjs = require('dayjs');

const {
    Schema
} = mongoose;

mongoose.connect(keys.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User schema

const userSchema = new Schema({
    id: String,
    timezone: String,
    webtoken: {
        string: String,
        expires: Date,
        actions: [String]
    }
});

// Get a user from their ID
userSchema.query.id = function (id) {
    return this.where({
        id
    });
};

// Generate a token
userSchema.methods.generateToken = async function (action, duration, force) {
    const user = this;


    // Format DB if needed
    let {
        webtoken
    } = user;
    if (!webtoken) webtoken = {};

    // Overwrite protection
    if (webtoken.string && !force) return false;

    // Generate the values
    const string = crypto.randomBytes(20).toString('hex');
    const expires = dayjs().add(duration, 'ms');
    const actions = Array.isArray(action) ? action : [action];

    // Update DB
    webtoken = {
        string,
        expires,
        actions
    }
    user.webtoken = webtoken;
    await user.save();

    // Return the token
    return string;
}

// Clear a token on a user
userSchema.methods.clearToken = async function () {
    const user = this;
    user.webtoken = null;
    await user.save();
    return;
}

// Verify that a token is valid
userSchema.methods.verifyToken = async function (token, action) {
    const user = this;

    // Check that there is a token in the database
    if (!user.webtoken) return {
        valid: false,
        reason: 'no_token'
    };

    const {
        string,
        expires,
        actions
    } = user.webtoken;

    if (!string) return {
        valid: false,
        reason: 'no_token'
    };

    // Check if token is correct
    if (token !== string) return {
        valid: false,
        reason: 'invalid_token'
    }

    // Check that token hasn't expired

    const now = new Date();

    if (now > expires) return {
        valid: false,
        reason: 'expired'
    }

    // Check that the action is valid for this token
    if (!actions.includes(action)) return {
        valid: false,
        reason: 'invalid_action'
    }

    return {
        valid: true,
        reason: null
    }
}

const User = mongoose.model('user', userSchema);

module.exports = {
    User
};