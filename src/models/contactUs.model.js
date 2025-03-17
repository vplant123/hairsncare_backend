const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    msg: {
        type: String
    },
    method :{
        type: String
    },
    phone: {
        type: Number,
        // required: true
    },
    email: {
        type: String,
        // required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
