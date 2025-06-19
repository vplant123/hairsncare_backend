const express = require("express");
// const userValidation = require("../validations/user.validation.js");
const {
  createDoctor,
  assignDoctorToAppointment,
  getBookedAppointment,
  softDeleteTransaction,
  transactionData,
  updateProductDetails,
  deleteProductFromCategory,
  blockUnblock,
  addAdmin,
  searchUsers,
  updateAdminProfile,
  getallPatient,
  getProductsByCategory,
  getallDoctor,
  deleteUser,
  getTotalpatient,
  addProductToCategory,
  searchdoctor,
  getProduct,
  deleteproduct,
  getProductById,
  getPendingAppointments,
  getOrders,
  getallDoctorData,
  editDoctor,
  getDoctor,
  getCoupons,
  editCoupon,
  deleteCoupon,
  sendWhatsapp,
  getReviewAll,
  deleteReview,
  AllUserData,
  contactDetails,
  getAdmin,
  addInvoice,
  getInvoices,
  getInvoiceById,
  syncProduct,
  addBlog,
  allBlog,
  getBlog,
  getNews,
  addNews,
  addBlogCategory,
  allBlogCategory,
  getNewsFeed,
  //
  deleteDoctor,
  getMonthlyHairTestData,
  createFollowUp,
  getpatientData,
  assignDoctorForPrescription,
  createFollowupAppointment,
  getFollowUps,
  getOrderById,
  deleteAdmin,
  getMyProfile,
  deleteContactquery,
  sendReport,
  sendPrescription,
  sendOrderPrescription,
  deleteQuery,
} = require("../controllers/admin.controller.js");
const adminValidation = require("../validations/admin.validations.js");
const { verifyJwt } = require("../middlewares/auth.middleware.js");
const validate = require("../helpers/validate.js");
const { addPlan } = require("../controllers/plan.controller.js");

const router = express.Router();

router.post("/addDoctor", createDoctor);
router.get("/allpatient", verifyJwt, getallPatient);

router.post("/addAdmin", addAdmin);
router.post("/getAdmin", getAdmin);

router.get("/get-Booked-appointment", getBookedAppointment);
router.post("/assignAppointmentToDoctor", verifyJwt, assignDoctorToAppointment);

router.get("/transaction-data", verifyJwt, transactionData);
router.delete("/transaction-delete", softDeleteTransaction);
router.put("/update-admin-profile", verifyJwt, updateAdminProfile);

router.get("/alldoctor", verifyJwt, getallDoctor);
router.get("/all-doctor-Data", getallDoctorData);

router.post("/edit-doctor", editDoctor);
router.post("/get-doctor/:id", getDoctor);

router.get("/allPendingAppointment", getPendingAppointments);
router.delete("/deleteuser", verifyJwt, deleteUser);
router.get("/totalpatient", verifyJwt, getTotalpatient);

router.post("/addproduct", verifyJwt, addProductToCategory);

router.get("/product/:id", getProductById);
router.get("/product", getProduct);
router.put("/update-product", verifyJwt, updateProductDetails);

router.get("/productBycategory", verifyJwt, getProductsByCategory);

router.delete(
  "/deleteProductFromCategory",
  verifyJwt,
  deleteProductFromCategory
);

router.delete("/deleteproduct", verifyJwt, deleteproduct);

router.get("/search", verifyJwt, searchUsers);
router.get("/search-doctor", verifyJwt, searchdoctor);
router.put("/block", verifyJwt, blockUnblock);
router.post("/addPlan", addPlan);

router.get("/getOrders", getOrders);

router.get("/getCoupons", verifyJwt, getCoupons);
router.post("/editCoupon", verifyJwt, editCoupon);
router.post("/deleteCoupon", verifyJwt, deleteCoupon);

router.post("/sendWhatsapp", verifyJwt, sendWhatsapp);

router.post("/getReviewAll", verifyJwt, getReviewAll);
router.post("/deleteReview/:id", deleteReview);

router.post("/allUserData", verifyJwt, AllUserData);

router.post("/contactDetails", verifyJwt, contactDetails);

router.post("/addInvoice", verifyJwt, addInvoice);
router.post("/getInvoices", verifyJwt, getInvoices);
router.post("/getInvoiceById", verifyJwt, getInvoiceById);

router.post("/syncProduct", syncProduct);
router.post("/addBlog", addBlog);
router.post("/getBlog", getBlog);
router.post("/allBlog", allBlog);
router.post("/getNews", getNews);
router.post("/addNews", addNews);
router.post("/addBlogCategory", addBlogCategory);
router.post("/allBlogCategory", allBlogCategory);
router.post("/getNewsFeed", getNewsFeed);

//new Api's Fonix
router.get("/reports/monthly-hairtest", verifyJwt, getMonthlyHairTestData);
router.delete("/delete-doctor", verifyJwt, deleteDoctor);
router.post("/followups", verifyJwt, createFollowUp);
router.post("/get-patient-Data", getpatientData);

router.post(
  "/assignDoctorForPrescription",
  verifyJwt,
  assignDoctorForPrescription
);
router.post(
  "/create-Followup-Appointment",
  verifyJwt,
  createFollowupAppointment
);
router.post("/get-folllowUp-appointment", verifyJwt, getFollowUps);
router.post("/order-details", verifyJwt, getOrderById);

router.post("/delete-admin", verifyJwt, deleteAdmin);
router.get("/my-profile", verifyJwt, getMyProfile);
router.delete("/deleteContact", verifyJwt, deleteContactquery);

router.post("/send-report", verifyJwt, sendReport);
router.post("/send-prescription", verifyJwt, sendPrescription);

router.post("/send-order-prescription", verifyJwt, sendOrderPrescription);
router.post("/delete-query", verifyJwt, deleteQuery);

// router.get("/doctors", alldoctors);

module.exports = router;
