const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const Order = require("../models/order.model.js");
const Payment = require("../models/payment.model.js");
const Razorpay = require("razorpay");
const Plan = require("../models/plan.model");
const Review = require("../models/Review.model.js");
const Appointment = require("../models/Appointment.model.js");
const CommonHelper = require("../utils/commonHelper.js");
const { sendEmail } = require("../utils/nodemailer.util.js");
const sendOTP = require("../utils/fast2sms.utils.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Product = require("../models/products.models.js");
const HairTest = require("../models/hairTest.model.js");
const { WhatsappTextTemplate } = require("../utils/Whatsapp.js");
const CouponsModel = require("../models/Coupons.model.js");
const CouponsMappingModel = require("../models/CouponsMapping.model.js");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const zohoService = require("./zoho.service.js");
const { generateOrderNumber } = require("../utils/orderNumberGenerator.js");
const LoginModel = require("../models/loginHistory.model.js");
const asyncHandler = require("../utils/asyncHandler.js"); // Assumed to be available

const instance = new Razorpay({
  key_id: "rzp_test_8ZrSJwOa8vWxQu",
  key_secret: "IppjQRgEVWjB5cnPvoP1jMB8",
});

function formatDateToYMD(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

class UserService {
  registerService = async (data) => {
    console.log("Incoming registration data:", data);
    console.log("Fullname type:", typeof data.fullname);
    console.log("Fullname value:", data.fullname);

    const user = await User.findOne({ mobile: data.mobile, isVerified: true });
    console.log("Found user:", user);

    if (!user) {
      throw new ApiError(
        400,
        "User is not verified, first verify mobile number"
      );
    }

    // Safely assign incoming data
    if (data.fullname && typeof data.fullname === "string") {
      console.log("Setting fullname to:", data.fullname.trim());
      user.fullname = data.fullname.trim();
    } else {
      console.log("Fullname validation failed:", {
        hasFullname: !!data.fullname,
        fullnameType: typeof data.fullname,
      });
    }

    if (data.email && typeof data.email === "string") {
      user.email = data.email.toLowerCase();
    }

    if (data.password && data.password !== "") {
      const passwordHash = await CommonHelper.hashPassword(data.password);
      user.password = passwordHash;
    }

    user.status = true;
    user.lastLogin = new Date();
    user.registration_method =
      data.registration_method || user.registration_method;

    await user.save();

    const accessToken = await CommonHelper.generateAccessToken(user._id);
    console.log(accessToken);
    const refreshToken = await CommonHelper.generateRefreshToken(user._id);

    if (!user.zohoUserId) {
      let productData = {
        data: [
          {
            Last_Name: user?.fullname?.split(" ")?.[1] || user?.fullname,
            First_Name: user?.fullname,
            Email: user?.email,
            Phone: user?.mobile,
          },
        ],
      };
      try {
        let record = await zohoService.createRecord({
          module: "Contacts",
          reqData: productData,
        });
        let u = await User.updateOne(
          { _id: user?._id },
          { zohoUserId: record?.data?.[0]?.details?.id?.toString() }
        );
        console.log("hjjjjj", u, record?.data?.[0]?.details?.id);
      } catch (error) {
        console.log("knmsnjdi", error);
      }

      await sendEmail(
        data.email,
        "Welcome to HairsnCares.com!",
        `Hi ${data?.fullname},\n\nWelcome to HairsnCares.com! Your account is now ready.\n\nTo log in, please use the OTP sent to your registered mobile number or email.\n\nBest Regards,\nThe HairsnCares Team`
      );

      await WhatsappTextTemplate({
        attr: null,
        name: user?.fullname,
        phone: user?.mobile?.toString(),
        campName: "take_hair_test1",
        media: {
          url: "https://res.cloudinary.com/drkpwvnun/image/upload/v1725767282/hair-assessment/yxuwxkxqko0uwyr2m7rw.jpg",
          filename: "file",
        },
      });
    }

    // Final output preserved as-is
    return {
      accessToken,
      refreshToken,
      role: user?.role,
      user,
    };
  };

  loginService = async (data, req) => {
    console.log(data);
    const user = await User.findOne({ email: data.email });
    console.log(user);

    if (!user) {
      // Optional: record failed login
      await LoginModel.create({
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        status: "failed",
        location: "Unknown",
      });

      throw new ApiError(401, "User does not exist");
    }

    const isPasswordValid = await CommonHelper.isPasswordCorrect(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      await LoginModel.create({
        userId: user._id,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        status: "failed",
        location: "Unknown",
      });

      throw new ApiError(400, "Invalid user credential");
    }

    const accessToken = await CommonHelper.generateAccessToken(user._id);
    const refreshToken = await CommonHelper.generateRefreshToken(user._id);

    // ✅ Record successful login
    await LoginModel.create({
      userId: user._id,
      ipAddress: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
      location: "Unknown", // or use geo-ip if needed
    });

    const role = user.role;
    return { accessToken, refreshToken, role, user };
  };

  forgetPassword = async (data) => {
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new ApiError(400, "user not found");
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();
    await sendEmail(
      data.email,
      "OTP for password recovery",
      `put this otp on required field to reset password
          ${otp}`
    );
  };

  updatePassword = async (data) => {
    const user = await User.findOne({ email: data.email });
    const validOtp = CommonHelper.isValidOTP(user.otpCreatedAt);
    if (!validOtp) {
      throw new ApiError(400, "OTP expired");
    }
    if (user.otp !== data?.otp) {
      throw new ApiError(400, "Invalid Otp");
      // throw new ApiError(400, "Invalid OTP");
    }
    const hashedPassword = await CommonHelper.hashPassword(data.newPassword);
    user.password = hashedPassword;
    user.otp = "";
    await user.save();
  };
  changePassword = async (req, data) => {
    const { user } = req;

    if (!user || !user._id) {
      throw new ApiError(404, "User not found or user ID is missing");
    }
    const userToUpdate = await User.findById(user._id);
    if (!userToUpdate) {
      throw new ApiError(404, "User not found");
    }
    const isPasswordCorrect = await CommonHelper.isPasswordCorrect(
      data.oldPassword,
      userToUpdate.password
    );
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid old password");
    }
    const hashpass = await CommonHelper.hashPassword(data.newPassword);
    userToUpdate.password = hashpass;
    await userToUpdate.save({ validateBeforeSave: false });
  };

  bookAppointment = async (req, data) => {
    const { user } = req;

    console.log("[DEBUG] Book Appointment Service - Request Data:", data);
    console.log("[DEBUG] Book Appointment Service - User:", user);

    // Check if user or user ID is missing
    if (!user || !user._id) {
      console.error(
        "[ERROR] Book Appointment Service - User or user ID is missing"
      );
      throw new Error("User not found or user ID is missing");
    }

    const loggedInUser = await User.findById(user._id);
    console.log(
      "[DEBUG] Book Appointment Service - Logged-in user details:",
      loggedInUser
    );

    // Retrieve selected plan by ID
    const selectedPlan = await Plan.findById(data.planId);
    console.log(
      "[DEBUG] Book Appointment Service - Selected Plan:",
      selectedPlan
    );

    // Convert plan price to number
    const planPrice = Number(selectedPlan.price);
    let discount = 0;
    if (data?.couponId) {
      let coupon = await CouponsModel.findOne({ _id: data?.couponId });

      if (coupon) {
        if (coupon.couponType === "fixed") {
          throw new Error(
            "Fixed amount coupons are not supported for this operation"
          );
        }
        const minOrderAmount = Number(coupon.minOrderAmount || 0);
        const percent = Number(coupon.percent || 0);
        if (coupon.minOrderAmount && planPrice < minOrderAmount) {
          throw new Error(
            `Minimum order amount for this coupon is ${coupon.minOrderAmount}`
          );
        }
        discount = (planPrice * percent) / 100;
      }
    }

    // Handle case where selected plan is not found
    if (!selectedPlan) {
      console.error(
        "[ERROR] Book Appointment Service - Selected plan not found"
      );
      throw new Error("Selected plan not found");
    }

    // Calculate final amount
    const finalAmount = planPrice - discount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create the order
    const order = new Order({
      userId: user._id,
      orderNumber: orderNumber,
      planId: data.planId,
      amount: finalAmount,
      paymentMethod: "online",
      status: "pending",
      orderType: "Appointment",
    });

    await order.save();
    console.log("[DEBUG] Book Appointment Service - Order saved:", order);

    // Retrieve the appointment based on test ID
    const appointment = await Appointment.findOne({ hairTestId: data?.testId });
    console.log(
      "[DEBUG] Book Appointment Service - Found appointment:",
      appointment
    );

    if (!appointment) {
      console.error(
        "[ERROR] Book Appointment Service - No appointment found for testId:",
        data?.testId
      );
      throw new Error("No appointment found for the given test ID");
    }

    // Update appointment details
    appointment.orderId = order._id;
    appointment.status = "booked";
    appointment.appointmentDate =
      selectedPlan.features === "appointment"
        ? formatDateToYMD(data.appointmentDate)
        : "";
    appointment.timeSlot =
      selectedPlan.features === "appointment" ? data.timeSlot : "noon";
    appointment.planId = data.planId;
    appointment.amount = finalAmount;
    appointment.coupon = data?.couponId || null;

    console.log(
      "[DEBUG] Book Appointment Service - Updated appointment details:",
      appointment
    );

    let plan = await Plan.findById(data?.planId).select("name");
    console.log("[DEBUG] Book Appointment Service - Plan name:", plan?.name);

    // Determine method based on plan
    if (plan?.name == "Local Plan") {
      appointment.Method = "Audio Call";
    } else {
      appointment.Method = "Video Call";
    }

    console.log(
      "[DEBUG] Book Appointment Service - Final appointment details:",
      appointment
    );

    // Save the appointment
    await appointment.save();
    console.log(
      "[DEBUG] Book Appointment Service - Appointment saved successfully"
    );

    // Prepare payment data
    const paymentData = {
      orderId: order._id,
      userId: user._id,
      totalAmount: finalAmount,
      paymentStatus: "pending",
      paymentMethod: "",
    };

    console.log(
      "[DEBUG] Book Appointment Service - Payment data prepared:",
      paymentData
    );

    // Create the payment entry
    const payment = new Payment(paymentData);
    const response = await payment.save();
    console.log("[DEBUG] Book Appointment Service - Payment saved:", response);

    return response;
  };

  updatePayment = async (req, data) => {
    const { user } = req;
    console.log("[STEP] User from request:", user);

    if (!user || !user._id) {
      console.log("[ERROR] User not found or user ID is missing");
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }

    const loggedInUser = await User.findById(user._id);
    console.log("[STEP] Logged in user from DB:", loggedInUser);

    // const selectedPlan = await Plan.findById(data.planId);
    // console.log("[STEP] Selected plan:", selectedPlan);

    // if (!selectedPlan) {
    //   console.log("[ERROR] Selected plan not found");
    //   const err = {
    //     status: 404,
    //     message: "Selected plan not found",
    //   };
    //   return err;
    // }

    console.log("[STEP] Payment data received:", data);
    await Payment.findOneAndUpdate(
      { orderId: data.id },
      { paymentStatus: "success" }
    );
    console.log("[STEP] Payment status updated to success for orderId:", data.id);

    const response = await Appointment.findOneAndUpdate(
      { orderId: data.id },
      { paymentStatus: "success", status: "booked" },
      { new: true }
    );
    console.log("[STEP] Appointment updated:", response);

    const hairTestUpdate = await HairTest.findOneAndUpdate(
      { _id: response?.hairTestId },
      { status: "completed" },
      { new: true }
    );
    console.log("[STEP] HairTest updated:", hairTestUpdate);

    await Order.findOneAndUpdate(
      { _id: data.id },
      { status: "paid" },
      { new: true }
    );
    console.log("[STEP] Order status updated to paid for orderId:", data.id);

    if (response?.coupon) {
      let couponMexist = await CouponsMappingModel.findOne({
        userId: user._id,
        coupon: response?.coupon,
        status: 1,
        type: 1,
      });
      console.log("[STEP] Coupon mapping found:", couponMexist);
      if (couponMexist) {
        couponMexist.status = 2;
        await couponMexist.save();
        console.log("[STEP] Coupon mapping status updated to 2");
      }
    }

    let orderC = await CouponsModel.findOne({ _id: response?.coupon });
    console.log("[STEP] Coupon model found:", orderC);

    let totalD = 0;
    if (response?.coupon)
      totalD =
        (parseFloat(orderC?.percent || 0) * parseFloat(selectedPlan?.amount)) /
        100;
    console.log("[STEP] Total discount calculated:", totalD);

    let zohoOrder = {
      data: [
        {
          Contact_Name: {
            id: user?.zohoUserId,
          },
          Discount: totalD,
          Status: "Delivered",
          Subject: `Hair Test`,
          Shipping_Country: "India",
        },
      ],
    };
    console.log("[STEP] Zoho order data prepared:", zohoOrder);

    let record = await zohoService.createRecord({
      module: "Sales_Orders",
      reqData: zohoOrder,
    });
    console.log("[STEP] Zoho record created:", record);

    if (record) {
      await Order.updateOne(
        { _id: data.id },
        { zoho_order_Id: record?.data?.[0]?.details?.id }
      );
      console.log("[STEP] Zoho order ID updated in Order model");
    }

    try {
      await sendEmail(
        user?.email,
        "Your Hair Test and Payment Confirmation",
        `Dear ${user?.fullname},We are pleased to inform you that your hair test has been successfully completed. 
Additionally, we have received your payment for the consultation. 
You can expect a confirmation and consultation call shortly.
After a thorough study and evaluation, Doctor will generate your hair analysis report. 
You can see that report in your MY REPORT section.
Stay tuned for your customized hair care plan!\n\nThank you for choosing Hairsncares.com for your hair health needs.
\n\nBest regards,\nHairsncares.com
`
      );
      console.log("[STEP] Confirmation email sent to user");

      await sendEmail(
        "info@vplanthairclinics.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
            Name : ${user?.fullname || ""},\n Phone : ${
          user?.mobile || ""
        },\n Email : ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
      console.log("[STEP] Notification email sent to vplanthairclinics");

      await sendEmail(
        "info@hairsncares.com",
        "New Hair Test Alert! 💇",
        `New Appointment Request\n\n
            Name : ${user?.fullname || ""},\n Phone : ${
          user?.mobile || ""
        },\n Email : ${user?.email || ""},\n Message: ${data?.message || ""}`
      );
      console.log("[STEP] Notification email sent to hairsncares");

      await WhatsappTextTemplate({
        attr: [user?.fullname || "user"],
        name: user?.fullname,
        phone: "9004405160",
        campName: "admin2_message_notification",
      });
      console.log("[STEP] WhatsApp notification sent to admin");

      await WhatsappTextTemplate({
        attr: null,
        name: user?.fullname,
        phone: user?.mobile?.toString(),
        campName: "Utility_Thankyou_Message_after_completing_hair_test",
      });
      console.log("[STEP] WhatsApp thank you message sent to user");
    } catch (error) {
      console.log("[ERROR] Error sending notifications:", error);
    }

    console.log("[STEP] Final updated payment response:", response);
    return response;
  };

  addReview = async (req, data) => {
    const { user } = req;
    console.log(".......", user);
    // console.log(data)
    let exist = false;
    if (user?.role != "admin")
      exist = await Review.findOne({
        userId: user._id,
        productId: data?.productId,
      });
    if (exist) return false;
    const review = new Review({
      userId: user._id,
      rating: data.rating,
      comment: data.comment,
      name: data?.name,
      productId: new mongoose.Types.ObjectId(data?.productId),
    });
    await review.save();

    let all = await Review.find({ productId: data?.productId });
    if (all?.length > 0) {
      let x = 0;
      all?.map((e) => {
        x = x + parseFloat(e?.rating || 0);
      });
      let tot = (parseFloat(x) / parseFloat(all?.length))?.toFixed(1);
      await Product.updateOne({ _id: data?.productId }, { review: tot });
    }
    return true;
  };

  getReview = async (req, data) => {
    const { id } = data;
    let reviews = await Review.find({
      $and: [
        { productId: new mongoose.Types.ObjectId(id) },
        { isDeleted: false },
      ],
    });
    return reviews;
  };
}
module.exports = new UserService();
