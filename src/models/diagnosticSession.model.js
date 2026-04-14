const mongoose = require("mongoose");

/**
 * TrichoScan AI — Production Diagnostic Session (Hardened v7.1)
 */

const STATES = [
  "INIT",
  "QUESTIONNAIRE_IN_PROGRESS",
  "QUESTIONNAIRE_COMPLETE",
  "PHOTOS_UPLOADED",
  "ANALYSIS_QUEUED",
  "ANALYSIS_IN_PROGRESS",
  "ANALYSIS_COMPLETE",
  "LEAD_CAPTURED",
  "REPORT_QUEUED",
  "REPORT_IN_PROGRESS",
  "REPORT_COMPLETE",
  "ERROR",
  "ABANDONED"
];

const diagnosticSessionSchema = new mongoose.Schema(
  {
    // PRD (§4.1) — Initial Identity
    sessionId: { 
      type: String, 
      unique: true, 
      default: () => require("crypto").randomUUID() 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    
    status: { type: String, enum: STATES, default: "INIT", required: true },
    
    // Timing & Expiry (§3 + Patch v7.1)
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    },
    
    // Responses (Audit-Ready)
    answers: {
      type: Map,
      of: new mongoose.Schema({
        value: mongoose.Schema.Types.Mixed,
        answeredAt: { type: Date, default: Date.now }
      }, { _id: false }),
      default: {}
    },
    completionRate: { type: Number, default: 0 }, 
    
    // Assets
    UploadedImage: [{ type: String }],
    
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    verificationOtp: String, // 6-digit numeric code
    isVerified: { type: Boolean, default: false }, // OTP Status (§1.2)
    
    // Results
    dseResult: mongoose.Schema.Types.Mixed,
    visionAnalysis: mongoose.Schema.Types.Mixed,
    visionAdjustedScores: mongoose.Schema.Types.Mixed, // VA-01 adjustment log §3.8
    compositeConfidence: mongoose.Schema.Types.Mixed, // §3.9
    clinicalNarrative: mongoose.Schema.Types.Mixed, // Persisted AI Storytelling §4
    treatmentRecommendations: mongoose.Schema.Types.Mixed,
    predictionImageData: mongoose.Schema.Types.Mixed,
    
    // Report Asset
    reportUrl: String,
    reportFileKey: String,
    reportGeneratedAt: Date,
    
    // Failure & Retry Handling (Patch v7.1)
    pipelineStatus: {
      dse: { type: String, default: "PENDING" },
      vision: { type: String, default: "PENDING" }
    },
    retryCount: { type: Number, default: 0 }, // Current attempt count
    maxRetries: { type: Number, default: 5 }, // Hard limit
    errorCode: String,                      // e.g., AI_VISION_FAILED
    errorMessage: String,
    skipPhotoAnalysis: { type: Boolean, default: false } // PRD §3.6.5
  },
  {
    timestamps: true,
    strict: false
  }
);

/**
 * State Transition with Abandonment Check
 */
diagnosticSessionSchema.methods.transitionTo = async function(nextState) {
  this.status = nextState;
  this.lastActivityAt = Date.now();
  console.log(`[DiagnosticSession] Transition: ${this.status} | Session: ${this.sessionId}`);
  return this.save();
};

diagnosticSessionSchema.methods.checkCompletion = function() {
  const minRequiredCount = 20; 
  const actualCount = this.answers.size;
  this.completionRate = Math.round((actualCount / minRequiredCount) * 100);
  return this.completionRate >= 80;
};

const DiagnosticSession = mongoose.model("DiagnosticSession", diagnosticSessionSchema);

module.exports = { DiagnosticSession, STATES };
