const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const Appointment = require("../models/Appointment.model");
const HairTest = require("../models/hairTest.model");
const User = require("../models/user.model");
const Prescription = require("../models/prescription.model");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/products.models");
const Cart = require("../models/Cart.model");
const Doctor = require("../models/doctor.model");
const orderModel = require("../models/order.model");
const Plan = require("../models/plan.model.js");

const { v4: uuidv4 } = require("uuid");
const { WhatsappTextTemplate } = require("../utils/Whatsapp");

const getAssignedAppointmentsForDoctor = asyncHandler(async (req, res) => {
  try {
    const { user } = req;

    // Ensure that doctor ID is present in the user object
    if (!user || !user._id) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Doctor ID is required"));
    }

    const doctorObjectId = new mongoose.Types.ObjectId(user._id);

    // Fetch appointments for the doctor with appropriate filters
    let appointments = await Appointment.find({
      doctorId: doctorObjectId,
      isDeleted: false,
      status: { $in: ["assigned", "completed", "pending"] },
    })
      .populate("userId", "fullname email mobile registration_method") // Corrected populate usage
      .sort({ createdAt: -1 })
      .lean();

    appointments = await Promise.all(
      appointments.map(async (appointment) => {
        let progress = 0;
        let Method = "Other";

        // Get progress from HairTest
        if (appointment?.hairTestId || appointment?.followupOf) {
          const hairTest = await HairTest.findOne({
            $or: [
              { _id: appointment.hairTestId }, // Check using the original hairTestId
              { _id: appointment.followupOf }, // Check using the followupOf (in case it's a follow-up)
            ],
          }).lean();

          if (hairTest && typeof hairTest.progress === "number") {
            progress = hairTest.progress;
          }
        }

        // Get user's plan and determine Method
        let plan = await Plan.findOne({ userId: appointment.userId }).lean();
        if (plan && plan.name === "Local Plan") {
          Method = "Audio Call";
        } else {
          Method = "Video Call";
        }

        return { ...appointment, progress, Method };
      })
    );

    // Return the response with the appointments data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          appointments,
          "Assigned appointments retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching assigned appointments:", error);

    // Return a failure response with error message
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to retrieve assigned appointments",
          error.message
        )
      );
  }
});

const getHairTestDetail = asyncHandler(async (req, res) => {
  try {
    const { userId, hairTestId } = req.query;
    let hairTest;

    const projection = {
      nutritional: 0,
      lifeStyle: 0,
      stress: 0,
    };

    if (hairTestId) {
      hairTest = await HairTest.find({ _id: hairTestId }, projection);
      console.log("hairTest by ID:", hairTest);
    } else {
      hairTest = await HairTest.find({ userId: userId }, projection);
    }

    if (!hairTest || hairTest.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Hair test not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          hairTest,
          "Hair test details retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const getOrderedMedicine = asyncHandler(async (req, res) => {
  try {
    const { userId, orderId } = req.query;
    let order;

    if (orderId) {
      order = await orderModel
        .findOne({ _id: orderId })
        .populate({
          path: "userId",
          select: "fullname email mobile",
        })
        .lean();
    } else {
      order = await orderModel
        .find({ userId: userId })
        .populate({
          path: "userId",
          select: "fullname email mobile",
        })
        .lean();
    }

    if (!order || order === null) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Order not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, order, "Order details retrieved successfully")
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const acceptAppointment = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.query;
    // console.log(req.params)

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "accepted" },
      { new: true }
    );

    if (!updatedAppointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Appointment not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAppointment,
          "Appointment accepted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});
const rejectAppointment = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.query;
    // console.log(req.params)

    const rejectAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "rejected" },
      { new: true }
    );

    if (!rejectAppointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Appointment not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, rejectAppointment, "Appointment rejected "));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const updateDoctorAccount = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.query;
    const updateData = req.body;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Doctor is updated successfully"));
  } catch (error) {
    throw new ApiError(400, "Something wrong".error.message);
  }
});

const prescriptionDetailForm = asyncHandler(async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const { appointmentId } = req.body;
    console.log("appointmentId", appointmentId);
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid appointment ID" });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already exists for this appointment",
        data: existingPrescription,
      });
    }

    req.body.showToUser = false;

    // Create prescription first
    const prescription = await Prescription.create(req.body);

    // Handle cart creation and updates
    const productArr = req.body?.test6?.medicines;
    if (productArr?.length > 0) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({
          userId: userId,
          cartId: uuidv4(),
          items: [],
          showToUser: false,
        });
      }

      const medicines = productArr[0]?.medicines;
      if (medicines && typeof medicines === "object") {
        for (const medicineName of Object.keys(medicines)) {
          const product = await Product.findOne({ name: medicineName });
          if (!product) continue;

          const existingItemIndex = cart.items?.findIndex(
            (e) => e?.item?._id.toString() === product._id.toString()
          );

          if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity +=
              medicines[medicineName]?.quantity || 1;
          } else {
            cart.items.push({
              item: product,
              quantity: medicines[medicineName]?.quantity || 1,
            });
          }
        }
        await cart.save();
      }
    }

    const appointment = await Appointment.findOne({
      userId,
      _id: appointmentId,
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const hairTest = await HairTest.findOne({
      userId,
      _id: appointment?.hairTestId,
    });

    if (hairTest) {
      hairTest.status = "completed";
      await hairTest.save();
    }
    // appointment.followUpDate = followUpDate;
    appointment.status = "completed";
    await appointment.save();

    return res.status(201).json({
      success: true,
      data: prescription,
      message: "Prescription created successfully",
    });
  } catch (error) {
    console.error("Error in prescriptionDetailForm:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
});

const updatePrescription = asyncHandler(async (req, res) => {
  try {
    const { appointmentId, userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid appointment ID" });
    }
    // console.log("useriddddddddd", userId)
    const user = await User.findOne({ _id: userId });

    await WhatsappTextTemplate({
      attr: [user?.fullname],
      name: user?.fullname,
      phone: user?.mobile?.toString(),
      campName: "get_report_after_hairtest1",
      media: {
        url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
        filename: "file",
      },
    });

    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId },
      { showToUser: true }
    );
    const cart = await Cart.findOneAndUpdate({ userId }, { showToUser: true });

    // console.log("Appointment Details:", appointment);

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    await WhatsappTextTemplate({
      attr: [user?.fullname],
      name: user?.fullname,
      phone: user?.mobile?.toString(),
      campName: "Utility_get_report",
      media: {
        url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
        filename: "file",
      },
    });

    await WhatsappTextTemplate({
      attr: [user?.fullname],
      name: user?.fullname,
      phone: user?.mobile?.toString(),
      campName: "buynow_medine",
      media: {
        url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725596233/hair-assessment/bhwlkkh2ul9dig5hnelp.png",
        filename: "file",
      },
    });
    // prescription.showToUser = true

    // const data = await Prescription.findOneAndUpdate(con
    // console.log("hi", prescription.showToUser)

    return res.status(201).json({
      success: true,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update prescription" });
  }
});

const getPrescription = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.query;

    // Fetch the prescription for the given appointmentId
    let prescription = await Prescription.findOne({
      appointmentId: appointmentId,
    });

    if (prescription) {
      // If prescription found, return success response
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            prescription,
            "Prescription detail fetched successfully"
          )
        );
    }

    // If no prescription found, try fetching the follow-up appointment
    const appointment = await Appointment.findById(appointmentId);
    console.log("appointment", appointment);

    if (appointment) {
      const MyhairTestId = appointment?.followupOf;
      const prevAppointment = await Appointment.findOne({
        hairTestId: MyhairTestId,
      });

      console.log("prevAppointment", prevAppointment);

      if (prevAppointment) {
        // Fetch the prescription for the previous appointment
        prescription = await Prescription.findOne({
          appointmentId: prevAppointment.id, // Use findOne() to get a single document
        });

        console.log("prescription", prescription);

        if (prescription) {
          return res
            .status(200)
            .json(
              new ApiResponse(
                200,
                prescription,
                "Prescription detail fetched successfully"
              )
            );
        }
      }
    }

    // If prescription is still not found, send an error response
    return res.status(404).send("Prescription not found for this user");
  } catch (error) {
    // Catch any errors and return the error response
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Something went wrong while getting prescription details"
        )
      );
  }
});

const getAllPrescription = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("njksnnfiwe", userId);
    const prescription = await Prescription.find({ userId: userId })?.sort({
      createdAt: -1,
    });

    if (!prescription || prescription?.length < 1) {
      return res.status(404).send("Prescription not found for this user");
    }
    let result = [];

    for (let index = 0; index < prescription.length; index++) {
      const element = prescription[index];
      const appointment = await Appointment.findOne({
        _id: element.appointmentId,
      });
      result.push({ ...element, appointmentData: appointment });
    }

    console.log("jsiejfiojes", result);

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Prescription detail fetched successfully")
      );
  } catch (error) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Something went wrong while getting prescription details"
        )
      );
  }
});

const ActiveDoctors = asyncHandler(async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
      showOnDashboard: true,
    });
    console.log("doctors", doctors);
    return res
      .status(200)
      .json(
        new ApiResponse(200, doctors, "Active doctors fetched successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to fetch active doctors"));
  }
});

module.exports = {
  acceptAppointment,

  getHairTestDetail,
  getOrderedMedicine,

  rejectAppointment,

  getAssignedAppointmentsForDoctor,

  updateDoctorAccount,
  prescriptionDetailForm,
  updatePrescription,
  getPrescription,
  getAllPrescription,

  ActiveDoctors,
};
