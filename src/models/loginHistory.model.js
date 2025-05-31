const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        return this.status === 'success'; // userId only required for successful logins
      }
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
