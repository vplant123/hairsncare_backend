const mongoose = require("mongoose");

const coupons = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    percent: {
      type: Number,
      required: true,
    },
    validity: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupons", coupons);
