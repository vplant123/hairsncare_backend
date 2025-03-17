const PatientStats = require("../models/patientstats.model");
const DoctorEarning = require("../models/doctorEarn.model");



class DashboardService {

    stats = async () => {
        const treatmentCount = await PatientStats.countDocuments({ status: 'treatment' });
        const checkupCount = await PatientStats.countDocuments({ status: 'check-up' });
        const otherCount = await PatientStats.countDocuments({ status: 'other' });

        const totalCount = treatmentCount + checkupCount + otherCount;

        const statusPercentage = {
            treatment: (treatmentCount / totalCount) * 100,
            checkup: (checkupCount / totalCount) * 100,
            other: (otherCount / totalCount) * 100

        }
        return statusPercentage;
    }

    doctorEarn = async () => {
        const doctorEarnings = await DoctorEarning.find();
        return doctorEarnings


    }
    recentPayment = async () => {
        const recentPayments = await PatientStats.find({}, { name: 1, appointmentFor: 1, appointmentDate: 1, amount: 1, paymentStatus: 1 })
            .sort({ appointmentDate: -1 })
            .limit(10);
        return recentPayments
    }
    deleteStats = async (data) => {
        await Patient.findByIdAndDelete(data.id);
        return true;
    }



}
module.exports = new DashboardService()
