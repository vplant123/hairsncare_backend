const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: Number, required: true },
    address: { type: String, required: true },
    date: { type: Date },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctors",
      // required: true,
      // type: String,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
          // type: String,
        },
        quantity: { type: String, required: true },
        rate: { type: String, required: true },
        gst: { type: String },
        discount: { type: String },
        discountPercent: { type: String },
        total: { type: String },
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
    paymentMode: { type: String }, // "cash" | "online"
    deliveryCharges: { type: Number },
    totalDiscount: { type: Number },
    totalAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoices", invoiceSchema);
