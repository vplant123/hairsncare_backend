const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    zohoToken: {
        type: String,
    },
    zohoRefreshToken: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('Tokens', TokenSchema);
