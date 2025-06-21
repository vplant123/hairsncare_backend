const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.status === "success"; // userId only required for successful logins
      },
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },
    location: {
      type: String,
      default: "Unknown",
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    // Additional fields for more detailed device information
    deviceModel: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Optional: Create index for performance on userId and loginTime
loginHistorySchema.index({ userId: 1, loginTime: -1 });

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
