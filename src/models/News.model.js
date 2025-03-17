const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({

    desc: {
        type: String
    },

    img: {
        type: String,
        // required: true
    },



}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
