const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: String,
    },
    timeSlot: {
      type: String,
      enum: ["morning", "noon", "evening"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctors",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "booked",
        "assigned",
        "accepted",
        "rejected",
        "completed",
      ],
      default: "pending",
    },
    duration: {
      type: Number,
      default: 2,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    hairTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HairTest",
    },
    amount: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "paid "],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    Method: {
      type: String,
      enum: ["Video Call", "Audio Call", "Other"],
      default: "Other",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupons",
    },
    appointmentType: {
      type: String,
      enum: ["prescription_only", "hair_test_with_prescription"],
      default: "hair_test_with_prescription",
      required: true,
    },

    // Follow-up Management
    followupOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    nextAction: {
      type: String,
      enum: ["followup", "continue_medicine", "none"],
      default: "none",
    },
    nextActionDate: {
      type: Date,
    },
    doctorNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual to retrieve all follow-up appointments linked to this one
appointmentSchema.virtual("followups", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "followupOf",
});

module.exports = mongoose.model("Appointment", appointmentSchema);
