const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    name : {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
