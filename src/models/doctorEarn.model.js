const mongoose = require('mongoose');

const doctorEarningSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

const DoctorEarning = mongoose.model('DoctorEarning', doctorEarningSchema);

module.exports = DoctorEarning;
