const express = require("express");
// const userValidation = require("../validations/user.validation.js");

// const { verifyJwt } = require("../middlewares/auth.middleware.js");
const {
  getHairTestDetail,
  getOrderedMedicine,

  getAssignedAppointmentsForDoctor,
  acceptAppointment,
  rejectAppointment,
  prescriptionDetailForm,
  getPrescription,
  getPrescriptionPdf,
  updatePrescription,
  getAllPrescription,
} = require("../controllers/doctor.controller.js");

const { verifyJwt } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/get-all-appointment", verifyJwt, getAssignedAppointmentsForDoctor);
router.get("/get-hair-test", getHairTestDetail);

router.get("/get-ordered-medicines", getOrderedMedicine);

router.post("/accept-appointment", acceptAppointment);
router.post("/reject-appointment", rejectAppointment);

router.post("/prescription-detail-form", prescriptionDetailForm);
router.post("/update-prescription", updatePrescription);

router.get("/getPrescription", getPrescription);
router.get("/getAllPrescription", getAllPrescription);

// router.post("/getPrescription-pdf", getPrescriptionPdf)

module.exports = router;
