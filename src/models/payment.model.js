const mongoose = require("mongoose")


const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    paymentType: {
        type: String,
        enum: ['credit', 'debit']
    },
    paymentStatus: {
        type: String,
        enum: ['success', 'pending', 'cancelled']
    },
    paymentMethod: {
        type: String,
        default: ""
    },
    // Date: {
    //     type: String,
    //     default: ""
    // },
    totalAmount: Number,
    status: { type: Boolean, default: true },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);