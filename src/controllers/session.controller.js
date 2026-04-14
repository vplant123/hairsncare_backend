const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { DiagnosticSession } = require("../models/diagnosticSession.model");
const Lead = require("../models/lead.model");
const { analysisQueue, reportQueue } = require("../queues/config");
const storageService = require("../services/storage.service");
const { getActiveQuestions } = require("../services/branching.service");
const { sendOTP, sendReportOTP } = require("../utils/fast2sms.utils.js");
const { decryptPII } = require("../utils/security");
const { prepareReportData } = require("../services/reportGenerator.service");

/**
 * TrichoScan AI — Session Controller (Final Hardened v8.1)
 * 
 * Logic exactly per PRD §1.2 Flow and Patch v7.1.
 */

const createSession = asyncHandler(async (req, res) => {
  const session = await DiagnosticSession.create({
    userId: req.user?._id,
    status: "INIT"
  });
  return res.status(201).json(new ApiResponse(201, { sessionId: session.sessionId, status: "INIT" }, "Session created"));
});

const patchAnswers = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;

  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  // Lock questionnaire after completion (§1.4.5 Hardening)
  if (!["INIT", "QUESTIONNAIRE_IN_PROGRESS"].includes(session.status)) {
    throw new ApiError(403, "Questionnaire is already finalized for this session. Please start a new session.");
  }

  const now = new Date();
  answers.forEach(item => {
    let qId, val;

    if (item.questionId !== undefined) {
      // Format: { questionId: "...", value: "..." }
      qId = item.questionId;
      val = item.value;
    } else {
      // Format: { "Q_X_Y": "VALUE" }
      const keys = Object.keys(item);
      if (keys.length > 0) {
        qId = keys[0];
        val = item[qId];
      }
    }

    if (qId) {
      session.answers.set(qId, { value: val, answeredAt: item.answeredAt || now });
    } else {
      console.warn(`[DiagnosticSession] Could not parse answer item:`, item);
    }
  });

  session.checkCompletion(); 

  if (session.status === "INIT") {
    await session.transitionTo("QUESTIONNAIRE_IN_PROGRESS");
  } else {
    await session.save();
  }

  return res.status(200).json(new ApiResponse(200, { completionRate: session.completionRate, status: session.status }, "Synced"));
});

const completeQuestionnaire = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  // 1. Basic Completion Check (80%)
  if (!session.checkCompletion()) {
    throw new ApiError(403, `Questionnaire incomplete (${session.completionRate}%). 80% minimum required.`);
  }

  // 2. Strict Branching Enforcement (§1.4.5)
  // Convert Mongoose Map to a flat object of { questionId: value } for the service
  const answersObj = {};
  for (const [qId, entry] of session.answers) {
    answersObj[qId] = entry.value;
  }
  const activeQuestions = getActiveQuestions(answersObj);

  const missingBranches = [];
  activeQuestions.forEach(qId => {
    if (!session.answers.has(qId)) {
      missingBranches.push(qId);
    }
  });

  if (missingBranches.length > 0) {
    throw new ApiError(409, `Mandatory clinical branches missing: ${missingBranches.join(", ")}`, { missingBranches });
  }

  await session.transitionTo("QUESTIONNAIRE_COMPLETE");
  return res.status(200).json(new ApiResponse(200, { status: "QUESTIONNAIRE_COMPLETE" }, "Finalized and ready for analysis"));
});

const uploadImage = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  // 🛡️ PERMISSIVE PHOTO UPLOAD: Allow uploads during questionnaire completion, photo adjustment or even after report is complete (Upgrade Flow)
  if (!["QUESTIONNAIRE_COMPLETE", "PHOTOS_UPLOADED", "ANALYSIS_COMPLETE", "REPORT_COMPLETE"].includes(session.status)) {
    throw new ApiError(403, "Image upload is only allowed after questionnaire completion and before starting analysis.");
  }

  // 🛡️ UNIVERSAL FIELD EXTRACTION: Support 'image', 'file', or 'iage' (typo)
  const file = req.file || (req.files && (req.files.image?.[0] || req.files.file?.[0] || req.files.iage?.[0]));

  if (!file) {
    throw new ApiError(400, "Image file is required. Field names allowed: 'image' or 'file'.");
  }

  // 🛡️ HARD LIMIT: Allow exactly 4 images (Front, Crown, Left, Right)
  if (session.UploadedImage.length >= 4) {
    throw new ApiError(403, "Maximum of 4 images allowed per session.");
  }

  const savedImage = await storageService.saveImage(file.buffer, sessionId, file.originalname);
  session.UploadedImage.push(savedImage.url);

  if (session.UploadedImage.length >= 3) {
    await session.transitionTo("PHOTOS_UPLOADED");
  } else {
    await session.save();
  }

  return res.status(201).json(new ApiResponse(201, { count: session.UploadedImage.length }, "Saved"));
});

const triggerAnalysis = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { skipPhotos = false } = req.body || {}; // Fallback Flag (PRD §3.5)

  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  // Logic: 3 photos required UNLESS user explicitly skips them
  if (!skipPhotos && session.UploadedImage.length < 3) {
    throw new ApiError(403, "3 photos required or explicitly skip them.");
  }

  // PRD §4.1 Guard: Prevent bypassing the 80% questionnaire check
  if (!["QUESTIONNAIRE_COMPLETE", "PHOTOS_UPLOADED", "ANALYSIS_COMPLETE", "REPORT_COMPLETE"].includes(session.status)) {
    throw new ApiError(403, `Cannot trigger analysis. Ensure questionnaire is completed (Current Status: ${session.status}).`);
  }

  // Update status internally to inform the worker
  session.skipPhotoAnalysis = !!skipPhotos; 
  if (skipPhotos) {
    session.pipelineStatus.vision = "SKIPPED_BY_USER";
  }

  await session.transitionTo("ANALYSIS_QUEUED");

  return res.status(202).json(new ApiResponse(202, { 
    status: "ANALYSIS_QUEUED",
    isFallback: skipPhotos
  }, skipPhotos ? "Analysis Prepared (DSE-Only). Proceed to lead capture." : "Analysis Prepared (Full Scan). Proceed to lead capture."));
});

const captureLead = asyncHandler(async (req, res) => {
  const { sessionId, name, email, phone, consentPrivacyPolicy, consentToContact } = req.body;
  if (!consentPrivacyPolicy || !consentToContact) throw new ApiError(400, "Consent required.");

  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  const ALLOWED_LEAD_STATES = ["PHOTOS_UPLOADED", "ANALYSIS_QUEUED", "ANALYSIS_COMPLETE", "REPORT_COMPLETE", "ERROR"];
  if (!ALLOWED_LEAD_STATES.includes(session.status)) {
    throw new ApiError(403, `Cannot capture lead at current status: ${session.status}`);
  }

  const lead = await Lead.findOneAndUpdate(
    { sessionId: session._id },
    { name, email, phone, consent: true },
    { upsert: true, new: true, runValidators: true }
  );
  session.leadId = lead._id;
  
  await session.transitionTo("LEAD_CAPTURED");
  
  // 3. Dispatch OTP to the lead's phone (§1.2 Flow)
  try {
    const otpCode = await sendReportOTP(phone);
    session.verificationOtp = otpCode;
  } catch (otpErr) {
    console.warn(`[CaptureLead] OTP dispatch failed but lead saved:`, otpErr.message);
  }

  await session.transitionTo("LEAD_CAPTURED");

  return res.status(202).json(new ApiResponse(202, { status: session.status }, "Lead saved. Please verify OTP to start analysis."));
});

const getStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await DiagnosticSession.findOne({ sessionId }).populate("leadId");
  if (!session) throw new ApiError(404, "Session not found");

  const markers = session.clinicalNarrative?.visualMarkers || {};
  
  const photos = (session.UploadedImage || []).map((url, index) => {
    const types = ["front", "crown", "left", "right"];
    const type = types[index] || "other";
    
    // Ensure URL has leading slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return {
      url: cleanUrl,
      type: type,
      marker: markers[type] || { top: 50, left: 50, label: "Analyzing Area" }
    };
  });

  const data = {
    status: session.status,
    sessionId: session.sessionId,
    isVerified: session.isVerified,
    reportUrl: session.reportUrl,
    photos: photos, // Renamed from images
    createdAt: session.createdAt,
    retryCount: session.retryCount,
    message: session.errorMessage || "Processing diagnostic data..."
  };

  const ALLOWED_DOSSIER_STATES = ["ANALYSIS_COMPLETE", "LEAD_CAPTURED", "REPORT_QUEUED", "REPORT_IN_PROGRESS", "REPORT_COMPLETE"];
  if (ALLOWED_DOSSIER_STATES.includes(session.status)) {
    data.clinicalNarrative = session.clinicalNarrative; 
    data.dseResult = session.dseResult;
    data.visionAnalysis = session.visionAnalysis;
    data.lead = session.leadId;
  }

  // Also include original questionnaire answers if requested
  data.answers = session.answers;

  return res.status(200).json(new ApiResponse(200, data, "Diagnostic status and full dossier retrieved."));
});

const getReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  if (session.status !== "REPORT_COMPLETE") {
    throw new ApiError(403, "Report not yet generated. Please wait.");
  }

  // OTP Lock Enforcement (§1.2 Flow)
  if (!session.isVerified) {
    throw new ApiError(401, "OTP Verification required to access clinical report.");
  }

  // 🛡️ S3 SECURE ACCESS: Presign the PDF link (PRD §8.3)
  const presignedReportUrl = await storageService.generatePresignedUrl(session.reportUrl);

  return res.status(200).json(new ApiResponse(200, { 
     url: presignedReportUrl, 
     isFallback: session.pipelineStatus.vision === "FAILED_DEGRADED_TO_DSE_ONLY",
     fallbackType: "DSE_ONLY"
  }, "Ready"));
});

/**
 * GET /api/v1/sessions/:sessionId/result
 * Returns the FULL clinical JSON for UI rendering after OTP verification.
 * PRD §7.4: Digital Dossier Payload
 */
const getResult = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await DiagnosticSession.findOne({ sessionId }).populate("leadId");
  if (!session) throw new ApiError(404, "Session not found");

  // 🛡️ ZERO-BLOCKING POLICY: Always return data, allow frontend to handle UI based on 'status'
  // (Removed 403 state checks to ensure the frontend never stops)
  
  // PRD §1.2 Paywall: Verify OTP first
  if (!session.isVerified) {
    throw new ApiError(401, "Please verify your identity via OTP to see your detailed results.");
  }

  // 🛡️ S3 SECURE ACCESS: Generate Presigned URLs for Photos (PRD §8.3)
  const presignedImages = await Promise.all(
    (session.UploadedImage || []).map(async (url) => {
      return await storageService.generatePresignedUrl(url);
    })
  );

  // Clone session to avoid side-effects on the DB doc
  const sessionWithPresignedUrls = {
    ...session.toObject(),
    UploadedImage: presignedImages
  };

  // Use the rich data preparation logic used for PDF generation
  const { mapDSEToReport, mergeRefinements } = require("../utils/reportTransformer");

  // 1. Generate Pure Mapper Shell (Deterministic Truth)
  const mapperShell = mapDSEToReport(sessionWithPresignedUrls, {
    withPhotoAnalysis: !session.skipPhotoAnalysis
  });

  // 2. Merge AI Refinements (Surgical Text Overlay)
  const aiData = session.clinicalNarrative || {};
  const transformedData = mergeRefinements(mapperShell, aiData);

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Report retrieved successfully.",
    data: transformedData
  });
});

const downloadReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // 1. Resolve Session
  const { DiagnosticSession } = require("../models/diagnosticSession.model");
  const session = await DiagnosticSession.findOne({ sessionId });
  
  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  // 2. Verify Access (PRD §1.2: Must be OTP verified)
  if (!session.isVerified) {
    throw new ApiError(401, "Please verify your session via OTP before downloading the report.");
  }

  // 3. Generate PDF Buffer
  const { generateReportPDF } = require("../services/reportGenerator.service");
  const pdfBuffer = await generateReportPDF(session._id);

  // 4. Stream Response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=TrichoScan_Report_${sessionId.split('-').pop()}.pdf`);
  res.setHeader("Content-Length", pdfBuffer.length);

  return res.end(pdfBuffer);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { otp } = req.body;

  const session = await DiagnosticSession.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session not found");

  if (!session.verificationOtp) {
    throw new ApiError(400, "No OTP found for this session. Please capture lead first.");
  }

  if (session.verificationOtp !== otp) {
    throw new ApiError(401, "Invalid or Expired OTP code.");
  }

  session.isVerified = true;
  await session.save();

  // 🚀 TRIGGER ANALYSIS & REPORT ONLY AFTER OTP VERIFICATION (§UX Stage Gate)
  console.log(`[VerifyOTP] ${sessionId} verified. Triggering AI Analysis pipeline...`);
  
  await analysisQueue.add("process-ai", { 
    sessionId: session.sessionId,
    isFallback: session.skipPhotoAnalysis 
  }, { 
    attempts: 5, 
    backoff: { type: "exponential", delay: 2000 }
  });

  return res.status(200).json(new ApiResponse(200, { 
    isVerified: true,
    status: "ANALYSIS_IN_PROGRESS",
    message: "Identity Verified. AI Analysis started."
  }, "Identity Verified. Analysis processing..."));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await DiagnosticSession.findOne({ sessionId }).populate("leadId");
  if (!session) throw new ApiError(404, "Session not found");

  const lead = await Lead.findOne({ sessionId: session._id });
  if (!lead || !lead.phone) {
    throw new ApiError(404, "Lead contact info not found. Capture lead first.");
  }

  let phone;
  try {
    phone = decryptPII(lead.phone);
  } catch (e) {
    phone = lead.phone;
  }

  console.log(`[ResendOTP] Dispatching new code for session ${sessionId} to ${phone}`);
  const otpNumber = await sendReportOTP(phone);
  
  session.verificationOtp = otpNumber;
  await session.save();

  return res.status(200).json(new ApiResponse(200, { sessionId }, "OTP resent successfully via registered service."));
});

module.exports = {
  createSession,
  patchAnswers,
  completeQuestionnaire,
  uploadImage,
  triggerAnalysis,
  captureLead,
  getStatus,
  getReport,
  verifyOtp,
  resendOtp,
  getResult,
  downloadReport
};
