const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    fromUserId: {
        type: String,
        required: true

    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    eventType: {
        type: String,
        enum: ["Appointment", "purchase products"]
    }




});

module.exports = mongoose.model('Notification', notificationSchema);
