const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    authorName: {
        type: String
    },
    authorDesignation :{
        type: String
    },
    authorImg: {
        type: String,
        // required: true
    },
    img: {
        type: String,
        // required: true
    },
    slug: {
        type: String,
        // required: true
    },
    tags: [{
        type: String,
        // required: true
    }],
    blogData:[{
        link : {
            type: String,
        },
        desc : {
            type: String
        },
    }],
    seoMetaTitle:[{
        type: String,
    }],
    seoMetaDesc:{
        type: String,
    },
    metaCanonical:{
        type: String,
    },
    category : {
        type: String,
    },
    isActive : {
        type: Boolean,
    },

}, { timestamps: true });

module.exports = mongoose.model('Blogs', blogSchema);
