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

          let appointments = await Appointment.find({
            isDeleted: false,
            status: { $in: ["assigned", "completed", "pending"] },
            $or: [{ hairTestId: test._id }],
          })
            .populate("doctorId", "fullname")
            .lean();

          // Debug: log doctorId values
          console.log(
            "appointment doctorId:",
            appointments.map((a) => a.doctorId)
          );

          // If doctorId is not populated, try populating all fields for debugging
          if (
            appointments.length > 0 &&
            (!appointments[0].doctorId || !appointments[0].doctorId.name)
          ) {
            appointments = await Appointment.find({
              isDeleted: false,
              status: { $in: ["assigned", "completed", "pending"] },
              $or: [{ hairTestId: test._id }],
            })
              .populate("doctorId")
              .lean();
            console.log(
              "[DEBUG] Populated all doctorId fields:",
              appointments.map((a) => a.doctorId)
            );
          }

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

// const getFollowupApointment = asyncHandler(async (req, res) => {
//   try {
//     const hairtests = await HairTest.find({
//       status: "completed",
//     })
//       .populate({
//         path: "userId",
//         select: "email personal status mobile",
//       })
//       .select("-Nutritional -LifeStyle -Stress -HairAndScalp -UploadedImage")
//       .lean();

//     if (!hairtests || hairtests.length === 0) {
//       return res
//         .status(200)
//         .json(new ApiResponse(200, "No hair tests found", []));
//     }

//     const hairtestsWithOrderData = await Promise.all(
//       hairtests.map(async (test) => {
//         try {
//           const orders = await OrderModel.findOne({
//             userId: test.userId,
//             orderType: "Appointment",
//           })
//             .select("amount")
//             .lean();

//           // Get the latest follow-up appointment (if any)
//           const latestFollowupAppointment = await Appointment.find({
//             isDeleted: false,
//             followupOf: test._id,
//           })
//             .populate("doctorId", "name")
//             .sort({ createdAt: -1 })
//             .lean();

//           console.log("latestFollowupAppointment", latestFollowupAppointment);

//           return {
//             ...test,
//             orders: orders || null,
//             appointments: latestFollowupAppointment
//               ? latestFollowupAppointment
//               : [],
//           };
//         } catch (innerError) {
//           console.error(
//             `Error fetching data for hairTestId: ${test._id}`,
//             innerError
//           );
//           return {
//             ...test,
//             orders: [],
//             appointments: [],
//           };
//         }
//       })
//     );

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           "All hair tests fetched successfully",
//           hairtestsWithOrderData
//         )
//       );
//   } catch (error) {
//     console.error("getFollowupApointment error:", error);
//     throw new ApiError(400, "Something went wrong", error.message);
//   }
// });

const getFollowupApointment = asyncHandler(async (req, res) => {
  try {
    const appointments = await Appointment.find({
      isDeleted: false,
      appointmentType: { $ne: "prescription_only" },
    })
      .populate("doctorId", "name")
      .populate("userId", "fullname email mobile registration_method")
      .sort({ createdAt: -1 })
      .lean();

    if (!appointments || appointments.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No Appointments found", []));
    }

    let filteredAppointments = appointments.filter(
      (a) => a.followupOf || a.status === "completed"
    );

    // Optional: Sort so that followupOf appointments come first, then by createdAt
    filteredAppointments.sort((a, b) => {
      // If both have or don't have followupOf, sort by createdAt desc
      if (!!b.followupOf === !!a.followupOf) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Appointments with followupOf come first
      return b.followupOf ? 1 : -1;
    });

    const hairtestsWithOrderData = await Promise.all(
      filteredAppointments.map(async (appoint) => {
        try {
          // Fetch the associated order data for the appointment
          const order = await OrderModel.findOne({
            userId: appoint.userId?._id || appoint.userId,
            orderType: "Appointment",
          })
            .select("amount")
            .lean();

          // Use either hairTestId or followupOf to find the associated hair test data
          const hairTestIdToUse = appoint.hairTestId || appoint.followupOf;
          let progress = 0;

          if (hairTestIdToUse) {
            const hairTest = await HairTest.findById(hairTestIdToUse).lean();
            if (hairTest && typeof hairTest.progress === "number") {
              progress = hairTest.progress;
            }
          }

          // Determine the method of consultation based on the plan
          let Method = "Other"; // Default value
          if (appoint.planId) {
            const plan = await Plan.findById(appoint.planId).lean();
            if (plan) {
              if (plan.name === "Local Plan") {
                Method = "Audio Call";
              } else if (plan.name === "Premium Plan") {
                Method = "Video Call";
              }
            }
          }

          return {
            ...appoint,
            followUpDate: appoint.followUpDate || null,
            progress,
            Method,
            orderAmount: order?.amount || null,
          };
        } catch (innerError) {
          console.error("Error fetching data for appointment:", innerError);
          return {
            ...appoint,
            followUpDate: null,
            progress: 0,
            Method: "Other",
            orderAmount: null,
          };
        }
      })
    );

    // Return the successfully fetched appointments with related data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          hairtestsWithOrderData,
          "All appointments fetched successfully",
          "Success"
        )
      );
  } catch (error) {
    console.error("getFollowupAppointment error:", error);
    throw new ApiError(400, null, "Something went wrong", error.message);
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

// const createHairTestForUserStepWise = asyncHandler(async (req, res) => {
//   try {
//     let { id, data } = req.body;
//     let newHairTest;

//     // Log the incoming request data
//     console.log("Received Data:", data);

//     if (!data?.userId) {
//       return res.status(400).json({ message: "User id is required" });
//     }

//     // Find if there is an existing hair test
//     const hairTest = await HairTest.findOne({ userId: data?.userId });
//     if (hairTest) {
//       id = hairTest._id;
//       console.log("Found existing Hair Test with ID:", id);
//     }

//     if (!id) {
//       // Create new Hair Test if none exists
//       console.log("Creating new Hair Test with data:", data);
//       newHairTest = await HairTest.create(data);
//       const appointment = new Appointment({
//         userId: data?.userId,
//         appointmentDate: "",
//         timeSlot: "noon",
//         status: "pending",
//         paymentStatus: "pending",
//         hairTestId: newHairTest?._id,
//       });

//       await appointment.save();
//       console.log("New Hair Test created and Appointment scheduled.");
//     } else {
//       // Update the existing Hair Test
//       console.log("Updating existing Hair Test with ID:", id);
//       newHairTest = await HairTest.findOne({ _id: id, userId: data?.userId });
//       let newData = {
//         ...newHairTest?.data,
//         ...data,
//       };
//       await HairTest.updateOne({ _id: id }, newData);
//       console.log("Existing Hair Test updated.");
//     }

//     // Log user information and send notifications
//     if (data?.personal && data?.personal?.phoneNumber) {
//       const user = await User.findOne({ _id: data?.userId });
//       console.log(
//         "Sending Whatsapp and email notifications to user:",
//         user?.fullname
//       );

//       WhatsappTextTemplate({
//         attr: null,
//         name: user?.fullname,
//         phone: "9004405160",
//         campName: "admin2_message_notification",
//       });

//       // Send emails
//       sendEmail(
//         "info@vplanthairclinics.com",
//         "New Hair Test Alert! 💇",
//         `New Appointment Request\n\nName: ${user?.fullname || ""},\nPhone: ${
//           user?.mobile || ""
//         },\nEmail: ${user?.email || ""},\nMessage: ${data?.message || ""}`
//       );
//       sendEmail(
//         "info@hairsncares.com",
//         "New Hair Test Alert! 💇",
//         `New Appointment Request\n\nName: ${user?.fullname || ""},\nPhone: ${
//           user?.mobile || ""
//         },\nEmail: ${user?.email || ""},\nMessage: ${data?.message || ""}`
//       );
//     }

//     // Check if new image is uploaded and send relevant emails
//     if (data?.UploadedImage?.length > 0 && !newHairTest?.UploadedImage) {
//       const user = await User.findOne({ _id: data?.userId });
//       let p1 = await Plan.findOne({ name: "Local Plan" });
//       let p2 = await Plan.findOne({ name: "Premium Plan" });

//       console.log("Sending result analysis email to user:", user?.email);
//       await sendEmail(
//         user?.email,
//         "Your Hair Test Results Are Being Analyzed",
//         `Dear ${user?.fullname},\n\nWe are pleased to inform you that your hair test has been successfully completed.\nBook Your Online Video Consultation Slot - Pay Rs. ${p2?.price}/-\nOr\nBook Your Online Consultation Slot - Pay Rs. ${p1?.price}/-\nThank you for choosing Hairsncares.com for your hair health needs.\n\nBest regards,\nHairsncares.com`
//       );
//     }

//     // Calculate the progress based on different conditions
//     let progress = 0;
//     if (newHairTest.personal) progress = 20;
//     if (newHairTest.nutritional) progress = 40;
//     if (newHairTest.lifeStyle) progress = 60;
//     if (newHairTest.stressManagement) progress = 80;
//     if (
//       newHairTest.hairAndScalpAssessment &&
//       newHairTest.UploadedImage &&
//       newHairTest.UploadedImage.length > 0
//     )
//       progress = 100;

//     console.log("Setting progress to:", progress);
//     newHairTest.progress = progress;
//     await newHairTest.save();

//     console.log("Hair Test created/updated successfully.");
//     return res.status(201).json({
//       success: true,
//       data: newHairTest,
//       message: "Successfully created",
//     });
//   } catch (error) {
//     console.error("Error creating/updating Hair Test:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to create hair test" });
//   }
// });

const createHairTestForUserStepWise = asyncHandler(async (req, res) => {
  try {
    let { id, data } = req.body;
    let newHairTest;

    // Log incoming request data
    console.log("Received Request Body:", req.body);

    if (!data?.userId) {
      console.log("Error: User id is required");
      return res.status(400).json({ message: "User id is required" });
    }

    // Check if an existing hair test exists for the user
    console.log("Checking if Hair Test exists for userId:", data?.userId);
    const hairTest = await HairTest.findOne({ userId: data?.userId });
    if (hairTest) {
      id = hairTest._id;
      console.log("Found existing Hair Test, using ID:", id);
    } else {
      console.log("No existing Hair Test found, creating a new one.");
    }

    // Log creation or update of Hair Test
    if (!id || !hairTest) {
      console.log("Creating new Hair Test with data:", data);
      newHairTest = await HairTest.create(data);
      const appointment = new Appointment({
        userId: data?.userId,
        appointmentDate: "",
        timeSlot: "noon",
        status: "pending",
        paymentStatus: "pending",
        hairTestId: newHairTest?._id,
      });

      await appointment.save();
      console.log(
        "New Hair Test created and Appointment scheduled with ID:",
        newHairTest?._id
      );
    } else {
      console.log("Updating existing Hair Test with ID:", id);
      newHairTest = await HairTest.findOne({ _id: id, userId: data?.userId });
      let newData = {
        ...newHairTest?.data,
        ...data,
      };
      await HairTest.updateOne({ _id: id }, newData);
      console.log("Existing Hair Test updated with new data:", newData);
    }

    // Calculate progress based on existing data
    let progress = 0;

    // Increment progress based on fields being populated
    if (newHairTest?.personal) progress += 20;
    if (newHairTest?.nutritional) progress += 20;
    if (newHairTest?.lifeStyle) progress += 20;
    if (newHairTest?.stressManagement) progress += 20;
    if (
      newHairTest?.hairAndScalpAssessment &&
      newHairTest?.UploadedImage?.length > 0
    )
      progress += 20;

    // Ensure that progress doesn't exceed 100%
    if (progress > 100) progress = 100;

    // Ensure progress is always a valid number (avoid NaN)
    if (isNaN(progress)) progress = 0;

    console.log("Calculated progress:", progress);

    // Update the progress field in the Hair Test object
    newHairTest.progress = progress;

    // Log updating progress in the Hair Test
    console.log("Updating progress field in Hair Test:", newHairTest.progress);

    // Save the updated Hair Test with progress
    await newHairTest.save();

    // Log sending notifications if phone number is provided
    if (data?.personal && data?.personal?.phoneNumber) {
      const user = await User.findOne({ _id: data?.userId });
      console.log(
        "Sending WhatsApp and email notifications to user:",
        user?.fullname
      );

      const whatsappResponse = WhatsappTextTemplate({
        attr: null,
        name: user?.fullname,
        phone: "9004405160",
        campName: "admin2_message_notification",
      });
      console.log("Whatsapp Response:", whatsappResponse);

      sendEmail(
        "info@vplanthairclinics.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
                    Name: ${user?.fullname || ""},\n Phone: ${
          user?.mobile || ""
        },\n Email: ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
      sendEmail(
        "info@hairsncares.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
                    Name: ${user?.fullname || ""},\n Phone: ${
          user?.mobile || ""
        },\n Email: ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
    }

    // Log checking if an image is uploaded and sending email if needed
    if (data?.UploadedImage?.length > 0 && !newHairTest?.UploadedImage) {
      const user = await User.findOne({ _id: data?.userId });
      let p1 = await Plan.findOne({ name: "Local Plan" });
      let p2 = await Plan.findOne({ name: "Premium Plan" });

      console.log(
        "Sending hair test result analysis email to user:",
        user?.email
      );
      const emailResponse = await sendEmail(
        user?.email,
        "Your Hair Test Results Are Being Analyzed",
        `Dear ${user?.fullname},\n\nWe are pleased to inform you that your hair test has been successfully completed.\n
Book Your Online Video Consultation Slot - Pay Rs. ${p2?.price}/-\nOr\nBook Your Online Consultation Slot - Pay Rs. ${p1?.price}/-\nThank you for choosing Hairsncares.com for your hair health needs.\n\nBest regards,\nHairsncares.com`
      );
      console.log("Email sent successfully:", emailResponse);
    }

    // Log successful response with new hair test data
    console.log("Hair Test successfully created or updated:", newHairTest);

    return res.status(201).json({
      success: true,
      data: newHairTest,
      message: "Successfully created",
    });
  } catch (error) {
    // Log error
    console.error("Error creating/updating Hair Test:", error);
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
  getFollowupApointment,
};
