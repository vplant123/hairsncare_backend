const mongoose = require("mongoose");

const coupons = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    percent: {
      type: Number,
      required: function() { return this.discountType === 'percent'; },
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      default: 'percent',
      required: true,
    },
    fixedAmount: {
      type: Number,
      required: function() { return this.discountType === 'fixed'; },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
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
