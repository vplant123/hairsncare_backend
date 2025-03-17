const mongoose = require('mongoose');

const BlogPageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    btnName: {
        type: String
    },
    img2:{
        type: String
    },
    name :
        {
            type: String,
            required: true
        },
        btnLink: {
            type: String
        },
        img2Link: {
            type: String
        },


}, { timestamps: true });

module.exports = mongoose.model('BlogPage', BlogPageSchema);
