const express = require("express");

const router = express.Router();
const userValidation = require("../validations/user.validation.js");
const validate = require("../helpers/validate.js");

// const { orderCreate, paymentCreate, paymentVerification } = require("../controllers/payment.controller");
const { verifyJwt, shipRocket } = require("../middlewares/auth.middleware");
const {
  bookAppointment,
  paymentVerification,
  updatePayment,
} = require("../controllers/bookAppointment.controller");
const {
  placeOrder,
  generatePaymentLink,
  deleteAllPayments,
  updatePaymentOrder,
  changeOrderStatus,
  shipOrder,

  updateOrder
} = require("../controllers/payment.controller.js");

// router.post("/order-create", verifyJwt, orderCreate);
// router.post("/payment-create", verifyJwt, bookAppointment);
router.post("/verification", paymentVerification);
router.post("/bookAppointment", verifyJwt, bookAppointment);
router.post("/update-payment", verifyJwt, updatePayment);
router.post("/update-payment-order", verifyJwt, updatePaymentOrder);

router.post("/place-order", verifyJwt, placeOrder);
router.post("/change-order-status", verifyJwt, changeOrderStatus);

router.post("/generate-paymentLink", verifyJwt, generatePaymentLink);
router.delete("/deleteAllPayment", deleteAllPayments);
router.post("/shipOrder", shipRocket, shipOrder);

router.post("/update-order",verifyJwt, updateOrder);

module.exports = router;
