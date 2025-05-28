// const User = require('../models/user.model.js');
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const UserService = require("../services/user.service.js");
const CommonHelper = require("../utils/commonHelper.js");
const User = require("../models/user.model.js");
const sendOTP = require("../utils/fast2sms.utils.js");
const Contact = require("../models/contactUs.model.js");
const userAddresses = require("../models/userAddresses.model.js");
const orderModel = require("../models/order.model.js");
const CouponsModel = require("../models/Coupons.model.js");
const CouponsMappingModel = require("../models/CouponsMapping.model.js");

const LoginModel = require("../models/loginHistory.model.js");

const patientRegister = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    let logedInUser = await UserService.registerService(req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { logedInUser }, "User register succesffully")
      );
  } catch (error) {
    if (error.code == 11000) {
      if (error.keyValue.email) {
        return res
          .status(400)
          .json(new ApiResponse(400, error, "Email already exists"));
      }
      if (error.keyValue.mobile) {
        return res
          .status(400)
          .json(new ApiResponse(400, error, "Mobile number already exists"));
      }
    }
    console.error("Error during signup:", error);
    throw new ApiError(400, "something went wrong", error.message);
  }
});

const sendotp = asyncHandler(async (req, res) => {
  try {
    // await User.deleteMany({ mobile: req.body.mobile });
    let existingUser = await User.findOne({
      mobile: req.body.mobile,
      isVerified: true,
    });

    console.log(existingUser);
    if (existingUser) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, existingUser, "Mobile number already verified")
        );
    }

    const temporaryEmail = generateTemporaryEmail();

    const otpGenerated = await sendOTP(req.body.mobile);
    console.log("Gen otp", otpGenerated);

    existingUser = await User.findOne({ mobile: req.body.mobile });
    let user;
    if (existingUser) {
      existingUser.otp = otpGenerated;
      existingUser.status = false;
      existingUser.otpCreatedAt = new Date();
      existingUser.email = temporaryEmail;
      await existingUser.save();
    } else
      user = await User.create({
        otp: otpGenerated,
        isVerified: false,
        status: false,
        otpCreatedAt: new Date(),
        mobile: req.body.mobile,
        email: temporaryEmail,
        role: "patient",
      });

    return res
      .status(200)
      .json(
        new ApiResponse(200, user || existingUser, "Otp sent successfully")
      );
  } catch (error) {
    console.log("eeeeeeeeeeeeeeer", error);
    throw new ApiError(
      400,
      "Something went wrong while sending OTP",
      error.message
    );
  }
});

function generateTemporaryEmail() {
  const randomNumber = generateRandomNumber();
  return `hairsrandom${randomNumber}@gmail.com`;
}

function generateRandomNumber() {
  return Math.floor(10000 + Math.random() * 90000); // Generates a random number between 1000 and 9999
}

const sendOtpForLogin = asyncHandler(async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log("mobile", mobile);
    const user = await User.findOne({ mobile: mobile });
    if (user) {
      if (user.role == "doctor" || user.role == "admin") {
        return res
          .status(201)
          .json(new ApiResponse(201, user, "please enter password"));
      }
      if (user?.isDeleted) {
        return res
          .status(400)
          .json(new ApiResponse(400, user, "User not exist"));
      }
    } else {
      return res.status(400).json(new ApiResponse(400, "please Sign up fisrt"));
    }
    const otpGenerated = await sendOTP(mobile.toString());
    console.log("Gen otp", otpGenerated);
    if (user) {
      user.otp = otpGenerated;
      user.otpCreatedAt = new Date();
      await user.save();
    } else {
      const temporaryEmail = generateTemporaryEmail();

      const newUser = new User({
        otp: otpGenerated,
        isVerified: false,
        status: false,
        otpCreatedAt: new Date(),
        mobile: mobile,
        email: temporaryEmail,
        role: "patient",
      });
      await newUser.save();
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Otp send successfully"));
  } catch (error) {
    console.log("error", error.message);
    throw new ApiError(400, "Something went wrong", error.message);
  }
});
const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      throw new ApiError(401, "User does not exist");
    }

    const validOtp = CommonHelper.isValidOTP(user.otpCreatedAt);
    console.log("..........", validOtp);
    if (!validOtp) {
      user.otpCreatedAt = null;
      user.otp = "";
      await user.save();
      return res.status(400).json(new ApiResponse(400, "Otp expired"));
    }
    if (user.otp !== otp) {
      return res.status(400).json(new ApiResponse(400, "Invalid otp"));
      // throw new ApiError(400, "Invalid OTP");
    }

    user.otp = null;
    user.otpCreatedAt = null;
    user.lastLogin = new Date();
    await user.save();

    const accessToken = await CommonHelper.generateAccessToken(user._id);
    const refreshToken = await CommonHelper.generateRefreshToken(user._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          logedInUser: {
            accessToken,
            refreshToken,
            user,
            role: user.role,
          },
        },
        "Login successful"
      )
    );
  } catch (error) {
    throw new ApiError(error.status || 400, error.message);
  }
});

const verify = asyncHandler(async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }
    const validOtp = CommonHelper.isValidOTP(user.otpCreatedAt);
    console.log("..........", validOtp);
    if (!validOtp) {
      (user.otpCreatedAt = null),
        (user.otp = ""),
        // user.mobile = null,
        await user.save();
      return res.status(400).json(new ApiResponse(400, "Otp expired"));
    }

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = "";
      user.otpCreatedAt = null;
      await user.save();

      return res
        .status(200)
        .json(new ApiResponse(200, "OTP verified successfully"));
    } else {
      return res.status(400).json(new ApiResponse(400, "Invalid OTP"));
    }
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Failed to verify OTP", error.message);
  }
});
const resendOtpMobile = asyncHandler(async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }

    const otpGenerated = await sendOTP(mobile);
    // console.log("Gen otp", otpGenerated);

    user.otp = otpGenerated;
    user.otpCreatedAt = new Date();
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "OTP resent successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Failed to resend OTP", error.message);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const logedInUser = await UserService.loginService(req.body, req); // pass req
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { logedInUser },
          `${logedInUser.role} logged in successfully`
        )
      );
  } catch (error) {
    console.error("Login error:", error);
    throw new ApiError(400, "Something went wrong: " + error.message);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    // console.log("rrrrrrrrr", req.user)
    await UserService.changePassword(req, req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(400, "Something wrong", error.message);
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  try {
    const forgetpassword = await UserService.forgetPassword(req.body);

    // if (!result.success) {
    //     return res.status(400).json(new ApiResponse(400, result.message));
    // }
    return res.status(200).json(new ApiResponse(200, "otp sent successfully"));
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }
    throw new ApiError(400, "error while sending otp", error.message);
  }
});
const updatePassword = asyncHandler(async (req, res) => {
  try {
    const updatePass = await UserService.updatePassword(req.body);
    return res.status(200).json(200, "Password updated successfully");
  } catch (error) {
    throw new ApiError(400, "Something went wrong  " + error.message);
  }
});
const addReview = asyncHandler(async (req, res) => {
  try {
    let x = await UserService.addReview(req, req.body);
    if (!x) {
      return res.status(400).json(new ApiResponse(400, "Already reviewed"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "review Addedd successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const getReview = asyncHandler(async (req, res) => {
  try {
    let reviews = await UserService.getReview(req, req.params);
    return res
      .status(200)
      .json(new ApiResponse(200, reviews, "review Addedd successfully"));
  } catch (error) {
    throw new ApiError(400, "something error", error.message);
  }
});

const contactUs = asyncHandler(async (req, res) => {
  try {
    const { name, mobile, message, city } = req.body;

    await Contact.create({
      name,
      mobile,
      city,
      message,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Thank you for your time . we will get back to you soon...."
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const addAddress = asyncHandler(async (req, res) => {
  try {
    const { userId, name, phone, fullAdress, pin, state, city, email } =
      req.body;

    if (!userId || !fullAdress || !pin) {
      return res.status(400).json(new ApiResponse(400, "Details required"));
    }
    let add = await userAddresses.create(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, add, "Address add successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const getAddress = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json(new ApiResponse(400, "Details required"));
    }
    let address = await userAddresses.find({ userId });
    return res
      .status(200)
      .json(new ApiResponse(200, address, "Address fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const editAddress = asyncHandler(async (req, res) => {
  try {
    const { id, name, phone, fullAdress, pin, city, state, email } = req.body;
    if (!id) {
      return res.status(400).json(new ApiResponse(400, "Details required"));
    }
    let address = await userAddresses.findOne({ _id: id });
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (fullAdress) address.fullAdress = fullAdress;
    if (pin) address.pin = pin;
    if (city) address.city = city;
    if (state) address.state = state;
    if (email) address.email = email;
    await address.save();

    return res
      .status(200)
      .json(new ApiResponse(200, address, "Address edit successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json(new ApiResponse(400, "Details required"));
    }
    let address = await userAddresses.findOneAndDelete({ _id: id });
    return res
      .status(200)
      .json(new ApiResponse(200, address, "Address delete successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const { user } = req;

    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }

    let orders = await orderModel
      .find({
        userId: user._id,
        isDeleted: false,
        orderType: "product Buy",
        deliveryStatus: {
          $in: ["processing", "shipped", "delivered", "canceled"],
        },
      })
      .populate("addressId")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "orders fetch successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { code, type, orderId, hairTestId } = req.body;
    if (!user || !user._id) {
      return res
        .status(404)
        .json({ message: "User not found or user ID is missing" });
    }
    if (!code) {
      return res.status(404).json({ message: "please enter code" });
    }
    let coupon = await CouponsModel.findOne({ code: code });
    if (!coupon) {
      console.log("coupon not found");
      return res.status(404).json({ message: "coupon not found" });
    }
    if (type != coupon?.type && coupon?.type != "3") {
      console.log("type different");
      return res.status(404).json({ message: "coupon not found" });
    }
    if (new Date() > coupon?.validity) {
      console.log("validity over");
      return res.status(404).json({ message: "coupon not found" });
    }
    let couponM = await CouponsMappingModel.findOne({
      userId: user._id,
      coupon: coupon?._id,
      status: 2,
      type: type,
    });
    if (couponM) {
      return res.status(404).json({ message: "coupon already used" });
    }

    let couponMexist = await CouponsMappingModel.findOne({
      userId: user._id,
      coupon: coupon?._id,
      status: 1,
      type: type,
    });
    if (!couponMexist) {
      let input = { userId: user._id, coupon: coupon?._id, status: 1, type: 2 };
      let createMap = await CouponsMappingModel.create(input);
    }

    // if(orderId){
    //     await orderModel.updateOne({_id : orderId},{coupon : coupon?._id})
    // }
    // if(hairTestId){
    //     await HairTest.updateOne({_id : hairTestId},{coupon : coupon?._id})
    // }
    return res
      .status(200)
      .json(new ApiResponse(200, coupon, "coupon applied successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong", error.message);
  }
});

module.exports = {
  patientRegister,
  sendOtpForLogin,
  verifyOtpAndLogin,
  contactUs,
  resendOtpMobile,
  verify,
  addReview,
  loginUser,
  changeCurrentPassword,
  forgetPassword,
  updatePassword,
  sendotp,
  addAddress,
  getAddress,
  editAddress,
  deleteAddress,
  getReview,
  getOrders,
  applyCoupon,
};
