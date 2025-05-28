const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const bcrypt = require("bcrypt");
const userSchema = new Schema(
  {
    registration_method: {
      type: String,
      enum: ["signup_page", "hair_test_submission"],
      required: true,
      default: "signup_page",
    },
    fullname: {
      type: String,
      // required: true
    },
    email: {
      type: String,
      // required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
      enum: ["admin", "patient", "doctor", "subadmin"],
      required: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    speciality: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      default: true,
      type: Boolean,
    },

    otpCreatedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    permission: {
      hairTest: {
        default: false,
        type: Boolean,
      },
      doctor: {
        default: false,
        type: Boolean,
      },
      patient: {
        default: false,
        type: Boolean,
      },
      website: {
        default: false,
        type: Boolean,
      },
      coupon: {
        default: false,
        type: Boolean,
      },
      orders: {
        default: false,
        type: Boolean,
      },
      contactus: {
        default: false,
        type: Boolean,
      },
      product: {
        default: false,
        type: Boolean,
      },
      reviews: {
        default: false,
        type: Boolean,
      },
      admin: {
        default: false,
        type: Boolean,
      },
    },
    zohoUserId: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
});

// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//             email: this.email,
//             role: this.role

//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }

//     )
// }
// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         {
//             id: this._id
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }
const User = mongoose.model("User", userSchema);

module.exports = User;
