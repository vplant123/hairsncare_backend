// const { Router } = require("express");
const express = require("express");
const { getContent, editHome, editExpertise, editAboutUs1, editSpecialist, editCustomerVideos, editContactUs, editHairWomen, editHairMen, editOnlineTest, editOtherProcedures, editDermatologist, editHairTransplant} = require("../controllers/utility.controller.js");





const router = express.Router();
router.post("/getContent", getContent)
router.post("/editHome", editHome)
router.post("/editExpertise", editExpertise)
router.post("/editAboutUs1", editAboutUs1)
router.post("/editSpecialist", editSpecialist)
router.post("/editVideoCustomer", editCustomerVideos)
router.post("/editContactUs", editContactUs)

router.post("/editHairWomen", editHairWomen)
router.post("/editHairMen", editHairMen)
router.post("/editOnlineTest", editOnlineTest)
router.post("/editOtherProcedures", editOtherProcedures)
router.post("/editDermatologist", editDermatologist)
router.post("/editHairTransplant", editHairTransplant)



module.exports = router;
