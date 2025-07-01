const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },

  description: {
    type: String,
    required: true,
  },
  kit: [
    {
      type: String,
    },
  ],
  src: [
    {
      type: String,
    },
  ],
  longDes: { type: String },
  stock: { type: String },
  discount: { type: String },
  category: { type: String },
  subCategory: { type: String },
  gst: { type: Number },
  expiryDate: { type: Date },
  batchNo: { type: String },
  mfgName: { type: String },
  hsn: { type: String },
  weight: { type: String },
  height: { type: String },
  width: { type: String },
  highlights: { type: String },
  shortDes: { type: String },
  benefitsMain: { type: String },
  productDisplay: { type: Boolean },
  benefits: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  ingredientMain: { type: String },
  zohoProductId: { type: String },
  ingredient: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  faq: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  review: {
    type: String,
    default: "0",
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: { type: String },
    amount: {
      type: Number,
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAddresses",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    products: [
      {
        item: productSchema,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    currency: {
      type: String,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupons",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderType: {
      type: String,
      enum: ["Appointment", "product Buy"],
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    deliveryCharges: {
      type: Number,
    },
    totalDiscount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    mode: {
      type: String,
      enum: ["cash", "online"],
      default: "online",
    },
    shipRocket_order_Id: {
      type: String,
    },
    zoho_order_Id: {
      type: String,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoices",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
