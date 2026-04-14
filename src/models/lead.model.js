const mongoose = require("mongoose");
const { encryptPII } = require("../utils/security");

/**
 * Lead Model
 * 
 * Implements §3 (Database Models) of prd.md.
 * Encrypts PII fields at rest (§10).
 */
const leadSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiagnosticSession",
      required: true,
      unique: true
    },
    // Encrypted PII §4.5
    name: String,
    email: {
      type: String,
      required: true
    },
    phone: String,
    consent: {
      type: Boolean,
      default: false
    },
    // Qualified metadata §7.1 from readme.md (still active)
    category: {
      type: String,
      enum: ["HOT_LEAD", "WARM_LEAD", "COLD_LEAD", "ORGANIC_NURTURE"],
      default: "COLD_LEAD"
    },
    priorityScore: Number,
    tags: [String],
    metadataSummary: String
  },
  { timestamps: true }
);

/**
 * Encryption Hook (§10)
 */
leadSchema.pre("save", function(next) {
  if (this.isModified("name") && this.name) {
    this.name = encryptPII(this.name);
  }
  if (this.isModified("email") && this.email) {
    this.email = encryptPII(this.email).toLowerCase(); 
  }
  if (this.isModified("phone") && this.phone) {
    this.phone = encryptPII(this.phone);
  }
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
