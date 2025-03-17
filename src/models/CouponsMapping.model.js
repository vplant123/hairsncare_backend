const mongoose = require('mongoose');

const couponsMapping = new mongoose.Schema({
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons'
    },
    userId: {
        type: String,
        required: true
    },
    status: {
        type: Number,    // 1-apply 2-used
    },
    type : {
        type: Number, 
    }

}, { timestamps: true });

module.exports = mongoose.model('CouponsMappings', couponsMapping);
