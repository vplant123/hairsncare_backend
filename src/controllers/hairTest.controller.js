const HairTest = require("../models/hairTest.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const constant = require("../constant.js");
const { uploadImageToCloudinary } = require("../utils/upload.utils.js");
const Appointment = require("../models/Appointment.model.js");
const { sendEmail } = require("../utils/nodemailer.util.js");
const Plan = require("../models/plan.model");
const { WhatsappTextTemplate } = require("../utils/Whatsapp.js");
const Prescription = require("../models/prescription.model.js");
const OrderModel = require("../models/order.model.js");

const createHairTestForUser = asyncHandler(async (req, res) => {
  try {
    const newHairTest = await HairTest.create(req.body);

    return res.status(201).json({
      success: true,
      data: newHairTest,
      message: "Successfully created",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create hair test" });
  }
});

const getHairTest = asyncHandler(async (req, res) => {
  try {
    const hairtests = await HairTest.find()
      .populate({
        path: "userId",
        select: "email personal status mobile",
      })
      .select("-Nutritional -LifeStyle -Stress -HairAndScalp -UploadedImage")
      .lean();

    if (!hairtests || hairtests.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No hair tests found", []));
    }

    const hairtestsWithOrderData = await Promise.all(
      hairtests.map(async (test) => {
        try {
          const orders = await OrderModel.findOne({
            userId: test.userId,
            orderType: "Appointment",
          })
            .select("amount")
            .lean();

          const plan = await Plan.findOne({
            userId: test.userId,
            orderType: "Appointment",
          })
            .select("amount")
            .lean();

          console.log("orders", orders);

          const appointments = await Appointment.find({
            isDeleted: false,
            status: { $in: ["assigned", "completed", "pending"] },
            $or: [{ hairTestId: test._id }, { followupof: test._id }],
          })
            .populate("doctorId", "name")
            .lean();

          return {
            ...test,
            orders: orders || null,
            appointments: appointments || [],
          };
        } catch (innerError) {
          console.error(
            `Error fetching data for hairTestId: ${test._id}`,
            innerError
          );
          return {
            ...test,
            orders: [],
            appointments: [],
          };
        }
      })
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "All hair tests fetched successfully",
          hairtestsWithOrderData
        )
      );
  } catch (error) {
    console.error("getHairTest error:", error);
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const updateHairTestStep = asyncHandler(async (req, res) => {
  const { step } = req.params;
  const stepNumber = parseInt(step);

  try {
    const hairTestId = req.params.id;
    const updateData = req.body;
    if (!updateData) {
      throw new ApiError(400, "Update data is required");
    }

    // Find the hair test by ID
    const hairTest = await HairTest.findById(hairTestId);
    if (!hairTest) {
      throw new ApiError(400, "Hair test not found");
    }

    // Update the corresponding step data
    switch (stepNumber) {
      case 1:
        hairTest.personalProfile = updateData.personalProfile;
        break;
      case 2:
        hairTest.nutritional = updateData.nutritional;
        break;
      case 3:
        hairTest.lifeStyle = updateData.lifeStyle;
        break;
      case 4:
        hairTest.stressManagement = updateData.stressManagement;
        break;
      case 5:
        hairTest.hairAndScalpAssessment = updateData.hairAndScalpAssessment;
        break;
      default:
        throw new ApiError(400, "Invalid step number");
    }

    // Increment step number
    hairTest[Object.keys(hairTest)[stepNumber - 1]].step = stepNumber;

    await hairTest.save();

    return res.status(200).json(new ApiResponse(200, hairTest, "Success"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});

const getHairTestDetail = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const userIdString = user._id.toString();
    console.log("jjjjjj", user);
    const hairTest = await HairTest.findOne({
      userId: userIdString,
      status: "pending",
    });
    // const hairTest = await HairTest.find()

    if (!hairTest) {
      const hairTestAll = await HairTest.find({
        userId: userIdString,
        status: "completed",
      }).sort({ createdAt: -1 });
      let hairTestComp = null;
      if (hairTestAll?.length < 1)
        return res
          .status(404)
          .json({ message: "Hair test details not found for the user" });
      for (let index = 0; index < 1; index++) {
        const element = hairTestAll[index];
        let app = await Appointment.findOne({ hairTestId: element._id });
        let prescription = await Prescription.findOne({
          appointmentId: app._id?.toString(),
        });
        console.log("naehuiohde", prescription, app, app._id?.toString());
        if (!prescription) {
          hairTestComp = element;
        }
      }
      console.log("koekrokjfer", hairTestComp);
      if (hairTestComp) {
        return res.status(200).json({ hairTestComp });
      } else
        return res
          .status(404)
          .json({ message: "Hair test details not found for the user" });
    }

    res.status(200).json({ hairTest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const imageUrl = await uploadImageToCloudinary(req.file);
    res.status(200).json({ imageUrl });
    console.log("......image url", imageUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const createHairTestForUserStepWise = asyncHandler(async (req, res) => {
  try {
    let { id, data } = req.body;
    let newHairTest;
    if (!data?.userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const hairTest = await HairTest.findOne({ userId: data?.userId });
    if (hairTest) {
      id = hairTest._id;
    }

    if (!id) {
      newHairTest = await HairTest.create(data);
      const appointment = new Appointment({
        userId: data?.userId,
        // orderId: order._id,
        appointmentDate: "",
        timeSlot: "noon",
        status: "pending",
        // planId: data.planId,
        // amount: selectedPlan.price,
        paymentStatus: "pending",
        hairTestId: newHairTest?._id,
      });

      await appointment.save();
    } else {
      newHairTest = await HairTest.findOne({ _id: id, userId: data?.userId });
      let newData = {
        ...newHairTest?.data,
        ...data,
      };
      await HairTest.updateOne({ _id: id }, newData);
    }
    if (data?.personal && data?.personal?.phoneNumber) {
      const user = await User.findOne({ _id: data?.userId });
      WhatsappTextTemplate({
        attr: null,
        name: user?.fullname,
        phone: "9004405160",
        campName: "admin2_message_notification",
      });

      sendEmail(
        "info@vplanthairclinics.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
                    Name : ${user?.fullname || ""},\n Phone : ${
          user?.mobile || ""
        },\n Email : ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
      sendEmail(
        "info@hairsncares.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
                    Name : ${user?.fullname || ""},\n Phone : ${
          user?.mobile || ""
        },\n Email : ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
    }
    //    console.log("newHairsefewewTest",data?.UploadedImage?.length > 0 && !newHairTest?.UploadedImage)
    if (data?.UploadedImage?.length > 0 && !newHairTest?.UploadedImage) {
      const user = await User.findOne({ _id: data?.userId });
      let p1 = await Plan.findOne({ name: "Local Plan" });
      let p2 = await Plan.findOne({ name: "Premium Plan" });

      await sendEmail(
        user?.email,
        "Your Hair Test Results Are Being Analyzed",
        `Dear ${user?.fullname},\n\nWe are pleased to inform you that your hair test has been successfully completed.\n
Book Your Online Video Consultation Slot -  Pay Rs. ${p2?.price}/-\nOr\nBook Your Online Consultation Slot - Pay Rs.  ${p1?.price}/-\nThank you for choosing Hairsncares.com for your hair health needs.\n\nBest regards,\nHairsncares.com
`
      );
    }

    let progress = 0;
    if (newHairTest.personal) progress = 20;
    if (newHairTest.nutritional) progress = 40;
    if (newHairTest.lifeStyle) progress = 60;
    if (newHairTest.stressManagement) progress = 80;
    if (
      newHairTest.hairAndScalpAssessment &&
      newHairTest.UploadedImage &&
      newHairTest.UploadedImage.length > 0
    )
      progress = 100;

    newHairTest.progress = progress;
    await newHairTest.save();

    return res.status(201).json({
      success: true,
      data: newHairTest,
      message: "Successfully created",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create hair test" });
  }
});

const updateAllHairTestProgress = asyncHandler(async (req, res) => {
  try {
    const hairTests = await HairTest.find();

    for (let hairTest of hairTests) {
      let progress = 100;
      // Assign the calculated progress to the hairTest
      hairTest.progress = progress;
      await hairTest.save();

      console.log("Updated progress:", progress); // Debug log to verify progress calculation
    }

    res.status(200).json({
      success: true,
      message: "Progress updated for all HairTest documents",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update progress" });
  }
});

module.exports = {
  createHairTestForUser,
  getHairTest,
  updateHairTestStep,
  uploadImage,
  getHairTestDetail,
  createHairTestForUserStepWise,
  updateAllHairTestProgress,
};
