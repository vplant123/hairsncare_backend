
const mongoose = require('mongoose');
const User = require("../models/user.model");
const { required, optional } = require('joi');
const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: String,

    },
    timeSlot: {
        type: String,
        enum: ['morning', 'noon', 'evening'],


    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'booked', 'assigned', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    hairTestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HairTest'
    },
    amount: {
        type: Number,

    },
    isDeleted: {
        default: false,
        type: Boolean
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "paid "],

    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        // required: true
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons'
    },


},{ timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);














