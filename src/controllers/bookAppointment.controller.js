const Order = require("../models/order.model");
const Notification = require("../models/notification.model.js");
const Payment = require("../models/payment.model");
const Appointment = require("../models/Appointment.model.js");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const UserService = require("../services/user.service.js");
const { sendEmail } = require("../utils/nodemailer.util.js");
const contactUsModel = require("../models/contactUs.model.js");
const zohoService = require("../services/zoho.service.js");

const bookAppointment = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const payment = await UserService.bookAppointment(req, req.body);

    return res.status(200).json(new ApiResponse(200, payment, "payment saved"));
  } catch (error) {
    console.log("error", error.message);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const updatePayment = asyncHandler(async (req, res) => {
  try {
    const payment = await UserService.updatePayment(req, req.body);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { paymentStatus: "success" }, "payment updated")
      );
  } catch (error) {
    console.log("error", error.message);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const paymentVerification = asyncHandler(async (req, res) => {
  try {
    const orderId = req.body.payload.payment_link.entity.reference_id;
    const method = req.body.payload.payment.entity.method;
    // const created_At=req.body.payload.payment_link.updated_At   //   in future i have to update this on payment model
    // console.log("..............................", req.body.payload)

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const { orderType } = order;

    let message, eventType;

    if (orderType === "Appointment") {
      message = `New Appointment has been booked of Rs.${req.body.payload.payment_link.entity.amount} and booking order id is :${req.body.payload.payment_link.entity.reference_id}`;
      eventType = " Appointment";
    } else if (orderType === "product Buy") {
      message = `New product has been purchased of Rs.${req.body.payload.payment_link.entity.amount} and order id is :${req.body.payload.payment_link.entity.reference_id}`;
      eventType = "purchase products";
    }

    if (req.body.payload.payment_link.entity.status === "paid") {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "paid" },
        { new: true }
      );
      const updatePaymentData = await Payment.findOneAndUpdate(
        { orderId: orderId },
        { paymentStatus: "success", paymentMethod: method },
        { new: true }
      );
      const updatedAppointment = await Appointment.findOneAndUpdate(
        { orderId: orderId },
        { status: "booked", paymentStatus: "paid" },
        { new: true }
      );
    }
    const admin = await User.find({ role: "admin" });
    // console.log("adminnnnnn", admin)
    const adminId = admin[0]._id;

    await Notification.create({
      message,
      fromUserId: req.body.payload.payment_link.entity.description,
      toUserId: adminId,
      eventType,
    });
    return res.status(200).json(200, "Appointment book successfull");
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const bookAppointmentContactUs = asyncHandler(async (req, res) => {
  try {
    let { name, email, phone, msg, method } = req.body;

    await contactUsModel.create(req.body);
    let reqData = {
      data: [
        {
          Last_Name: req.body?.name?.split(" ")?.[1] || req.body?.name,
          Email: email,
          Description: msg,
          // "Rating": "Acquired",
          Website: "https://www.hairsncares.com/",
          // "Twitter": "Twitter",
          // "Salutation": "Mr.",
          First_Name: req.body?.name?.split(" ")?.[0] || req.body?.name,
          Lead_Status: "Attempted to Contact",
          // "Industry": "ASP",
          // "Skype_ID": "Skype_ID",
          Phone: phone,
          // "Street": "Street",
          // "Zip_Code": "Zip_Code",
          // "Email_Opt_Out": false,
          Designation: method,
          // "City": "City",
          // "No_of_Employees": 1791,
          Mobile: phone,
          // "State": "State",
          Lead_Source: "Online Store",
          // "Country": "Country",
          // "Fax": "Fax",
          // "Annual_Revenue": 136.67,
          // "Secondary_Email": "newcrmapi@zoho.com"
        },
      ],
    };
    let record = await zohoService.createRecord({
      module: "Leads",
      reqData: reqData,
    });
    // let u = await User.updateOne({_id : element?._id},{zohoUserId : record?.data?.[0]?.details?.id?.toString()})
    console.log("hjjjjj", record?.data?.[0]?.details?.id);

    let sendEmail1 = await sendEmail(
      "hairsncares@gmail.com",
      "New Appointment for Hairsncares - Contact Us",
      `New Appointment Request\n\n
            Name : ${name || ""},\n Phone : ${phone || ""},\n Email : ${
        email || ""
      },\n Message: ${msg || ""},\n Preferred method : ${method} `
    );
    console.log("kfoker", sendEmail1);

    if (email) {
      let sendEmail2 = await sendEmail(
        email,
        "Thank you for contacting Hairsncares.com",
        `Our expert will get in touch shortly`
      );
      console.log("kfoker", sendEmail2);
    }
    return res.status(200).json(new ApiResponse(200, "saved"));
  } catch (error) {
    console.log("error", error.message);
    throw new ApiError(400, "Something wrong", error.message);
  }
});

module.exports = {
  bookAppointment,
  updatePayment,
  paymentVerification,
  bookAppointmentContactUs,
};
