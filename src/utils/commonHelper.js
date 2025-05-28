const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class CommonHelper {
  // generateAccessAndRefreshToken = async (user_id) => {
  //     try {
  //         const user = await User.findById(user_id)
  //         const accessToken = await generateAccessToken()
  //         const refreshToken = await generateRefreshToken()

  //         user.refreshToken = refreshToken
  //         await user.save({ validateBeforeSave: false })
  //         return { accessToken, refreshToken }
  //     } catch (error) {
  //         return error
  //     }

  // }
  hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  isPasswordCorrect = async (password, hashedPassword) => {
    console.log("password", password, hashedPassword);
    return await bcrypt.compare(password, hashedPassword);
  };
  generateAccessToken = async (user) => {
    console.log(process.env);
    console.log("keyyyyyy", process.env.ACCESS_TOKEN_SECRET);
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  };
  generateRefreshToken = async (user) => {
    return jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  };
  // isValidOTP = async (otpCreatedAt) => {
  //     const currentTime = new Date();
  //     const otpExpirationTime = new Date(otpCreatedAt.getTime() + 2 * 60000);
  //     const differenceInMilliseconds = otpExpirationTime - currentTime;

  //     const differenceInSeconds = differenceInMilliseconds / 1000;
  //     const diff = Math.abs(differenceInSeconds);
  //     // console.log("Difference in seconds:", diff);
  //     return diff > 120;
  // };
  // isValidOTP = (otpCreatedAt) => {

  //     if (otpCreatedAt instanceof Date && otpCreatedAt.getTime) {
  //         const currentTime = new Date();
  //         const otpExpirationTime = new Date(otpCreatedAt.getTime() + 2 * 60000);

  //         // Calculate difference in seconds
  //         const differenceInSeconds = (otpExpirationTime - currentTime) / 1000;

  //         // Check if difference is greater than 120 seconds (2 minutes)
  //         return differenceInSeconds > 120;
  //     }

  //     // return true; // Return true if otpCreatedAt is null or not a valid Date object
  // };
  isValidOTP = (otpCreatedAt) => {
    if (otpCreatedAt instanceof Date && otpCreatedAt.getTime) {
      const currentTime = new Date();
      const otpExpirationTime = new Date(otpCreatedAt.getTime() + 2 * 60000); // 2 minutes expiration time

      console.log("kmirejie", currentTime, otpExpirationTime);
      // Check if current time is before the OTP expiration time
      return currentTime < otpExpirationTime;
    }

    // Return false if otpCreatedAt is null or not a valid Date object
    return false;
  };
}

module.exports = new CommonHelper();
