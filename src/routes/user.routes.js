// const { Router } = require("express");
const express = require("express");
const userValidation = require("../validations/user.validation.js");
const { loginUser,
    contactUs,
    verify,
    resendOtpMobile,
    addReview,
    changeCurrentPassword,
    patientRegister,
    forgetPassword,
    updatePassword,
    sendotp,
    sendOtpForLogin,
    verifyOtpAndLogin,  
    addAddress,
    getAddress,
    editAddress,
    deleteAddress,
getReview, 
getOrders,
applyCoupon} = require("../controllers/user.controller.js");
const { verifyJwt } = require("../middlewares/auth.middleware.js");
const validate = require("../helpers/validate.js");
const { bookAppointmentContactUs } = require("../controllers/bookAppointment.controller.js");





const router = express.Router();
router.post("/sendotp", sendotp)
router.post("/resend-otp-mobile", resendOtpMobile)
router.post("/verifyOTP", verify)

router.post("/register", patientRegister)
router.post("/login", loginUser)
router.post("/sendOtpForLogin", sendOtpForLogin)
router.post("/verifyOtpAndLogin", verifyOtpAndLogin)

router.post("/contact-us", contactUs)

router.post("/changepassword", verifyJwt, changeCurrentPassword)

router.post("/forgetpassword", forgetPassword)
router.post("/add-review", verifyJwt, addReview)
router.get("/get-review/:id", getReview)

router.post("/resendOtp-email", forgetPassword) //resendOtp

router.post("/updatePassword", updatePassword)

router.post("/addAddress",verifyJwt, addAddress)
router.post("/getAddress",verifyJwt, getAddress)
router.post("/editAddress", verifyJwt,editAddress)
router.post("/deleteAddress", verifyJwt,deleteAddress)
router.post("/get-orders", verifyJwt,getOrders)

router.post("/bookAppointmentContactUs",bookAppointmentContactUs)

router.post("/applyCoupon",verifyJwt,applyCoupon)






module.exports = router;
