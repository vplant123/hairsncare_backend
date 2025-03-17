const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    status: {
        type: String,
        enum: ['treatment', 'check-up', 'other'],
        
    },
    amount: {
        type: Number,
        
    },
    appointmentDate: {
        type: Date,
        
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi'],
        
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'failed', 'success'],
       
    }
});

const PatientStats = mongoose.model('PatientStats', patientSchema);

module.exports = PatientStats;
