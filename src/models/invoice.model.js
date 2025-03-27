const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: Number, required: true },
    address: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctors",
      // required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: String,
          // required: true,
        },
        rate: {
          type: String,
          // required: true,
        },
        gst: {
          type: String,
          // required: true,
        },
        discount: {
          type: String,
          // required: true,
        },
        discountPercent: {
          type: String,
          // required: true,
        },
        total: {
          type: String,
          // required: true,
        },
      },
    ],
    total: { type: Number },
    paid: { type: Boolean },
    paidAmt: { type: Number },
    dues: { type: Number },
    isActive: { type: Boolean, default: true },
    invoiceNo: { type: Number },
    orderId: { type: String },
    orderDate: { type: Date },
    couponDiscount: { type: Number },
    paymentMode: { type: String },   //cash,//online
    deliveryCharges: { type: Number },
    totalDiscount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Invoices = mongoose.model("Invoices", invoiceSchema);

module.exports = Invoices;
