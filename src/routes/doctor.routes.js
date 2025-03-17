const express = require("express");
// const userValidation = require("../validations/user.validation.js");

// const { verifyJwt } = require("../middlewares/auth.middleware.js");
const { getHairTestDetail, getAssignedAppointmentsForDoctor, acceptAppointment, rejectAppointment, prescriptionDetailForm, getPrescription, getPrescriptionPdf, updatePrescription,getAllPrescription} = require("../controllers/doctor.controller.js");

// const { verifyJwt } = require("../middlewares/auth.middleware.js");




const router = express.Router();

router.get("/get-hair-test", getHairTestDetail)
router.post("/accept-appointment", acceptAppointment)
router.post("/reject-appointment", rejectAppointment)
router.get("/get-all-appointment", getAssignedAppointmentsForDoctor)
router.post("/prescription-detail-form", prescriptionDetailForm)
router.post("/update-prescription", updatePrescription)

router.get("/getPrescription", getPrescription)
router.get("/getAllPrescription", getAllPrescription)

// router.post("/getPrescription-pdf", getPrescriptionPdf)





module.exports = router