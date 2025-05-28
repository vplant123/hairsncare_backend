// const { Router } = require("express");
const express = require("express");
const {
  getContent,
  editHome,
  editExpertise,
  editAboutUs1,
  editSpecialist,
  editCustomerVideos,
  editContactUs,
  editHairWomen,
  editHairMen,
  editOnlineTest,
  editOtherProcedures,
  editDermatologist,
  editHairTransplant,
} = require("../controllers/utility.controller.js");

const { verifyJwt } = require("../middlewares/auth.middleware.js");

const router = express.Router();   
router.post("/getContent", verifyJwt, getContent);
  
router.post("/editHome", verifyJwt, editHome);
router.post("/editExpertise", verifyJwt, editExpertise);
router.post("/editAboutUs1", verifyJwt, editAboutUs1);  
router.post("/editSpecialist", verifyJwt, editSpecialist);
router.post("/editVideoCustomer", verifyJwt, editCustomerVideos);
router.post("/editContactUs", verifyJwt, editContactUs);

router.post("/editHairWomen", verifyJwt, editHairWomen);
router.post("/editHairMen", verifyJwt, editHairMen);
router.post("/editOnlineTest", verifyJwt, editOnlineTest);
router.post("/editOtherProcedures", verifyJwt, editOtherProcedures);
router.post("/editDermatologist", verifyJwt, editDermatologist);
router.post("/editHairTransplant", verifyJwt, editHairTransplant);

module.exports = router;
