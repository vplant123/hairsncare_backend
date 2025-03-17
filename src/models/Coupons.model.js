const mongoose = require('mongoose');

const coupons = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    percent: {
        type: Number,
        required: true,
    },
    validity: {
        type: Date,
    },
    isActive : {
        type: Boolean,
        default : true
    },
    type : {
        type: Number,   //1-hair-test //2 - order 3 - both
    },



}, { timestamps: true });

module.exports = mongoose.model('Coupons', coupons);
