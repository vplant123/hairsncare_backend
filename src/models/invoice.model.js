const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    // Basic customer information
    name: { type: String, required: true },
    mobile: { type: Number, required: true },
    email: { type: String },
    address: { type: String, required: true },
    date: { type: Date },

    // Customer reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Doctor/Consultant reference
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctors",
    },

    // Order items
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          require: false,
        },
        quantity: { type: String },
        rate: { type: String },
        gst: { type: String },
        discount: { type: String },
        discountPercent: { type: String },
        total: { type: String },
        batchNo: { type: String },
        stock: { type: Number },
        hsn: { type: String },
        mfgName: { type: String },
        expiryDate: {
          type: Date,
        },

        productName: { type: String },
      },
    ],

    // Financial calculations
    total: { type: Number },
    subtotal: { type: Number }, // Before tax and discounts
    totalGST: { type: Number }, // Total GST amount
    totalDiscount: { type: Number },
    couponDiscount: { type: Number },
    deliveryCharges: { type: Number },
    totalAmount: { type: Number },

    // Payment information
    paid: { type: Boolean, default: false },
    paidAmt: { type: Number },
    dues: { type: Number },
    paymentMode: { type: String }, // "cash" | "online" | "card" | "upi"
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentDate: { type: Date },
    transactionId: { type: String },

    // Shipping information
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String, default: "India" },
    },
    shippingMethod: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },

    // Order status and tracking
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],

    // Invoice and order references
    invoiceNo: { type: Number },
    orderId: { type: String },
    orderNumber: { type: String },
    orderDate: { type: Date },

    // Tax and compliance
    taxDetails: {
      cgst: { type: Number },
      sgst: { type: Number },
      igst: { type: Number },
      totalTax: { type: Number },
    },
    gstNumber: { type: String },
    panNumber: { type: String },

    // Business and admin fields
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for better query performance
invoiceSchema.index({ orderNumber: 1 });
invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Invoices", invoiceSchema);
