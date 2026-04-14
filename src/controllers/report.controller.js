const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const { DiagnosticSession } = require("../models/diagnosticSession.model");
const User = require("../models/user.model");

const { runDSE } = require("../services/dse.service");
const { analyseAllScalpImages, generateClinicalNarrativeAnthropic: generateClinicalNarrative } = require("../services/claude.service");
const { generateReportPDF } = require("../services/reportGenerator.service");
const storageService = require("../services/storage.service");
const leadsService = require("../services/leads.service");

const { mapDSEToReport, mergeRefinements } = require("../utils/reportTransformer");

/**
 * GET /api/v1/reports/result
 * Query: { hairTestId }
 *
 * Returns the full stored diagnostic result (DSE + Vision + Narrative + ReportURL)
 * normalized to the strict contract defined in report_api_response_spec.json.
 */
const getReportResult = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "sessionId is required"));
    }

    // Fetch the full diagnostic payload (Support both DB _id and sessionId UUID)
    const session = await DiagnosticSession.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(sessionId) ? sessionId : null },
        { sessionId: sessionId }
      ]
    })
      .populate("userId", "fullname email mobile")
      .lean();

    if (!session) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Clinical session not found"));
    }

    if (!session.dseResult) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Diagnostic analysis not yet available for this session"));
    }

    // TRANSFORM to STRICT SCHEMA v1.0
    const shell = mapDSEToReport(session, { withPhotoAnalysis: true });
    const reportData = mergeRefinements(shell, session.clinicalNarrative || {});

    return res.status(200).json(
      new ApiResponse(
        200,
        reportData,
        "Diagnostic results fetched successfully (normalized to spec v1.0)"
      )
    );
  } catch (error) {
    console.error("[ReportController] getReportResult error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message || "Failed to fetch result"));
  }
});

/**
 * POST /api/v1/reports/generate
 * Body: { hairTestId }
 *
 * TrichoScan AI Diagnostic Pipeline — 5 stages with full graceful degradation.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  STAGE 1 — DSE (Deterministic Scoring Engine)       [REQUIRED]          │
 * │    Zero AI dependency. Pure deterministic computation.                    │
 * │    Failure → ABORT. No report possible without a DSE result.             │
 * │                                                                          │
 * │  STAGE 2 — Claude Vision Analysis                   [CONDITIONAL]       │
 * │    PRD §3.1.4: Claude dispatched ONLY when ALL 3 images uploaded.        │
 * │    PRD §3.1.2: "If SPAM fails at any stage, the system degrades          │
 * │      gracefully to DSE-only mode without blocking report generation."    │
 * │    < 3 images uploaded → SKIP (DSE-only mode)                           │
 * │    Claude API error / parse error → SKIP (DSE-only mode)                │
 * │                                                                          │
 * │  STAGE 3 — OpenAI GPT-4o Clinical Narrative         [OPTIONAL]          │
 * │    OpenAI API error → built-in DSE fallback narrative is used            │
 * │    Report is ALWAYS generated — never blocked by OpenAI failure          │
 * │                                                                          │
 * │  STAGE 4 — PDF Generation (Puppeteer)               [OPTIONAL]          │
 * │    Puppeteer fails → return DSE JSON without PDF, but data still saved   │
 * │                                                                          │
 * │  STAGE 5 — Storage (local dev / S3 prod)            [OPTIONAL]          │
 * │    Storage fails → return DSE JSON without reportUrl                     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const generateReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "sessionId is required"));
  }

  console.log(`[ReportController] ── Starting pipeline for sessionId: ${sessionId}`);

  // Pipeline status tracking (returned in response for frontend transparency)
  const pipelineStatus = {
    dse:       "PENDING",
    vision:    "SKIPPED",
    narrative: "PENDING",
    pdf:       "PENDING",
    storage:   "PENDING",
  };

  // ── Load Clinical Session (Support Object ID or UUID) ─────────────────────
  const session = await DiagnosticSession.findOne({
    $or: [
      { _id: mongoose.isValidObjectId(sessionId) ? sessionId : null },
      { sessionId: sessionId }
    ]
  })
    .populate("userId", "fullname email mobile")
    .lean();

  if (!session) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Clinical session not found"));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 1 — DSE (REQUIRED)
  // Zero external API dependency; loaded from scoringWeights.json.
  // Non-recoverable: no DSE result = no report possible.
  // ──────────────────────────────────────────────────────────────────────────
  let dseResult;
  try {
    console.log(`[ReportController] [STAGE 1] Running DSE...`);
    dseResult = runDSE(session);
    pipelineStatus.dse = "COMPLETE";
    console.log(
      `[ReportController] [STAGE 1] ✅ DSE complete — HHI:${dseResult.hairHealthIndex}, Urgency:${dseResult.urgencyFlag}, Primary:[${dseResult.primaryConditions.join(", ")}]`
    );
  } catch (dseError) {
    pipelineStatus.dse = "FAILED";
    console.error(`[ReportController] [STAGE 1] ❌ DSE FAILED:`, dseError.message);
    // DSE failure is the only non-recoverable failure in the pipeline
    return res.status(500).json(
      new ApiResponse(
        500,
        { pipelineStatus },
        `Diagnostic scoring engine failed: ${dseError.message}`
      )
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2 — CLAUDE VISION (CONDITIONAL + GRACEFUL DEGRADATION)
  //
  // PRD §3.1.4: ALL 3 photos (P01 frontal, P02 crown, P03 macro) must be
  //   uploaded and in COMPLETE state before Vision AI is dispatched.
  //
  // PRD §3.1.2: "If SPAM fails at any stage, the system degrades gracefully
  //   to DSE-only mode without blocking report generation."
  //
  // Degradation cases:
  //   A) < 3 images uploaded → SKIPPED (DSE-only mode, not an error)
  //   B) Claude API error / timeout → FAILED (caught, pipeline continues)
  //   C) Claude returns invalid/unparseable JSON → FAILED (caught, continues)
  // ──────────────────────────────────────────────────────────────────────────
  // Vision analysis result + optional adjusted scores (from Score Adjustment Engine §3.8)
  let visionAnalysis = {
    status:                "SKIPPED",
    visionAnalysisAvailable: false,
    reason:                "Vision AI not triggered",
  };
  let adjustedScores      = null;  // set if Vision succeeds (§3.8 adjustedScores)
  let compositeConfidence = null;  // set if Vision succeeds (§3.9)

  const uploadedImages = session.UploadedImage || [];

  if (uploadedImages.length < 3) {
    // Degradation case A — insufficient images (PRD §3.1.4 + §3.6.5)
    const reason =
      uploadedImages.length === 0
        ? "No scalp images uploaded — running in DSE-only mode"
        : `Only ${uploadedImages.length}/3 required images uploaded — DSE-only mode`;

    visionAnalysis.reason = reason;
    pipelineStatus.vision = "SKIPPED_INSUFFICIENT_IMAGES";
    session.skipPhotoAnalysis = true; // PRD: Hide vision sections in PDF
    
    // Compute confidence with DSE data only (§3.9)
    const { computeCompositeConfidence } = require("../services/claude.service");
    compositeConfidence = computeCompositeConfidence(dseResult, null);
    
    console.log(`[ReportController] [STAGE 2] ⚠️  ${reason} | Confidence: ${compositeConfidence.score}% (${compositeConfidence.band})`);
  } else {
    // All 3 images present — dispatch Claude Vision (PRD §3.6.3)
    try {
      console.log(
        `[ReportController] [STAGE 2] All 3 images present. Dispatching Claude Vision...`
      );

      const visionResponse = await analyseAllScalpImages(uploadedImages, dseResult, session);

      // Vision succeeded — extract structured results
      visionAnalysis       = visionResponse;            // full result with visionResult sub-object
      adjustedScores       = visionResponse.adjustedScores;       // §3.8 adjusted probabilities
      compositeConfidence  = visionResponse.compositeConfidence;  // §3.9

      pipelineStatus.vision = "COMPLETE";
      console.log(
        `[ReportController] [STAGE 2] ✅ Vision complete — Confidence:${compositeConfidence?.score}% (${compositeConfidence?.band})`
      );
    } catch (visionError) {
      // Degradation cases B & C — Claude API failure / parse error / quality gate
      // PRD §3.1.2: MUST NOT block report generation
      visionAnalysis = {
        status:                  "FAILED",
        visionAnalysisAvailable: false,
        reason:                  `Vision API error — degraded to DSE-only: ${visionError.message}`,
      };
      pipelineStatus.vision = "FAILED_DEGRADED_TO_DSE_ONLY";
      console.error(
        `[ReportController] [STAGE 2] ❌ Vision FAILED — DSE-only mode. Error: ${visionError.message}`
      );
      // Do NOT throw
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 3 — TREATMENT RECOMMENDATION ENGINE (TRE)
  // ──────────────────────────────────────────────────────────────────────────
  // DEPRECATED: Treatment logic moved to utils/reportTransformer.js
  let treatmentPlan = { phase1: [], phase2: [], phase3: [] };
  console.log(`[ReportController] [STAGE 3] Skipped (Legacy engine decommissioned).`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 4 — CLAUDE NARRATIVE (GRACEFUL DEGRADATION)
  // ──────────────────────────────────────────────────────────────────────────
  let narrativeResult;
  try {
    console.log(`[ReportController] [STAGE 4] Generating clinical narrative (Claude 3.5)...`);
    
    // 4.1 Generate Mapper Shell (using FRESH dseResult instead of stale session)
    const shell = mapDSEToReport({ ...session, dseResult }, { withPhotoAnalysis: pipelineStatus.vision === "COMPLETE" });

    // 4.2 AI Refinement (Only if Photos are present, per user request v12.1)
    if (pipelineStatus.vision === "COMPLETE") {
      narrativeResult = await generateClinicalNarrative(
        shell,
        dseResult,
        compositeConfidence
      );
    } else {
      console.log(`[ReportController] [STAGE 4] SKIPPED (DSE-Only mode — using deterministic shell)`);
      narrativeResult = {}; // mergeRefinements will use the shell as-is
    }
    
    pipelineStatus.narrative = "COMPLETE";
    console.log(`[ReportController] [STAGE 4] ✅ Narrative complete`);
  } catch (narrativeError) {
    pipelineStatus.narrative = "FAILED_EMERGENCY_FALLBACK";
    console.error(`[ReportController] [STAGE 4] ❌ Narrative FAILED. Error: ${narrativeError.message}`);
    narrativeResult = {
      executiveSummary: `Clinical assessment complete. Findings are consistent with likely ${dseResult.primaryConditions[0] || "pattern hair loss"}.`,
      clinicalClassification: { primaryCondition: dseResult.primaryConditions[0], severity: dseResult.severityBand, staging: "Not applicable" },
      prognosis: "Assessment complete."
    };
  }

  // ── PERSIST ALL RESULTS TO SESSION BEFORE PDF GENERATION ──
  // This is CRITICAL for the headless Puppeteer browser, which will navigate to 
  // the frontend route /report-print/:id. The frontend will fetch these results from the database.
  const visionMode = pipelineStatus.vision === "COMPLETE" ? "FULL_AI" : "DSE_ONLY";

  const updatePayload = {
    dseResult,
    visionAnalysis: visionAnalysis.visionResult || null,
    clinicalNarrative:   narrativeResult,
    analysisStatus:      "DSE_COMPLETE",
    pipelineStatus,
    visionMode,
    skipPhotoAnalysis: session.skipPhotoAnalysis || false,
    // Store adjusted scores if Vision succeeded (§3.8)
    ...(adjustedScores      ? { visionAdjustedScores: adjustedScores }      : {}),
    // Store composite confidence (§3.9)
    ...(compositeConfidence ? { compositeConfidence }                        : {}),
  };

  await DiagnosticSession.findByIdAndUpdate(
    session._id,
    { $set: updatePayload },
    { new: true }
  );
  console.log(`[ReportController] [PERSIST] 💾 Results saved — now triggering PDF generation.`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 5 — PDF GENERATION (HEADLESS NAVIGATION)
  // ──────────────────────────────────────────────────────────────────────────
  let pdfBuffer = null;
  try {
    console.log(`[ReportController] [STAGE 5] Rendering PDF via Puppeteer (Headless Nav)...`);
    // Updated: Only pass ID. Puppeteer will navigate to frontend and fetch data from DB.
    pdfBuffer = await generateReportPDF(session._id);
    pipelineStatus.pdf = "COMPLETE";
    console.log(`[ReportController] [STAGE 5] ✅ PDF rendered (${pdfBuffer.length} bytes)`);
  } catch (pdfError) {
    pipelineStatus.pdf = "FAILED_PDF_UNAVAILABLE";
    console.error(`[ReportController] [STAGE 5] ❌ PDF generation FAILED. Error: ${pdfError.message}`);
    // Do NOT throw
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 6 — STORAGE (OPTIONAL)
  // ──────────────────────────────────────────────────────────────────────────
  let savedReport = null;
  if (pdfBuffer) {
    try {
      console.log(`[ReportController] [STAGE 6] Saving report to storage...`);
      savedReport = await storageService.saveReport(pdfBuffer, session._id);
      pipelineStatus.storage = "COMPLETE";
      console.log(`[ReportController] [STAGE 6] ✅ Report saved: ${savedReport.url}`);
    } catch (storageError) {
      pipelineStatus.storage = "FAILED_NO_REPORT_URL";
      console.error(`[ReportController] [STAGE 6] ❌ Storage FAILED. Error: ${storageError.message}`);
    }
  } else {
    pipelineStatus.storage = "SKIPPED_NO_PDF";
  }

  // Final Update to add reportUrl
  const hasReport = !!(savedReport?.url);
  if (hasReport) {
    await DiagnosticSession.findByIdAndUpdate(
      session._id,
      { 
        $set: {
          reportUrl:         savedReport.url,
          reportFileKey:     savedReport.fileKey,
          reportGeneratedAt: new Date(),
          analysisStatus:    "REPORT_COMPLETE"
        }
      }
    );
  }

  console.log(
    `[ReportController] ── Pipeline complete | DSE:${pipelineStatus.dse} | Vision:${pipelineStatus.vision} | Narrative:${pipelineStatus.narrative} | PDF:${pipelineStatus.pdf} | Storage:${pipelineStatus.storage} | Mode:${visionMode}`
  );

  // ── QUALIFY AS LEAD (§1.2 & §7.1) ──────────────────────────────────────────
  if (session.userId) {
    try {
      console.log(`[ReportController] Qualifying user ${session.userId._id} for medical team follow-up...`);
      await leadsService.qualifyAndSaveLead(
        session.userId._id, 
        dseResult, 
        visionAnalysis
      );
    } catch (err) {
      console.warn(`[ReportController] Lead qualification warning: ${err.message}`);
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId,

        // Report file (null if PDF or storage stage failed)
        reportUrl:     savedReport?.url     || null,
        reportFileKey: savedReport?.fileKey || null,

        // DSE Core result (ALWAYS present — the guaranteed baseline)
        dseResult: {
          hairHealthIndex:     dseResult.hairHealthIndex,
          severityBand:        dseResult.severityBand,
          urgencyFlag:         dseResult.urgencyFlag,
          primaryConditions:   dseResult.primaryConditions,
          secondaryConditions: dseResult.secondaryConditions,
          conditions:          dseResult.conditions,
          compositeFiringLog:  dseResult.compositeFiringLog,
          dataCompletenessPct: dseResult.dataCompletenessPct,
          scoringEngineVersion:dseResult.scoringEngineVersion,
        },

        // Vision-adjusted scores (null if Vision was skipped/failed)
        visionAdjustedScores: adjustedScores      || null,
        compositeConfidence:  compositeConfidence  || null,

        // Pipeline transparency
        pipelineStatus,
        visionMode,
        narrativeFallback: narrativeResult?.fallback || false,
        generatedAt:       new Date().toISOString(),
      },
      hasReport
        ? `Diagnostic report generated successfully (${visionMode} mode)`
        : `Diagnostic analysis complete in ${visionMode} mode — PDF report unavailable`
    )
  );
});

/**
 * GET /api/v1/reports/dse
 * Query: { hairTestId }
 *
 * Runs ONLY the DSE engine and returns the scoring result.
 * No AI APIs called. No PDF generated.
 * Useful for admin preview or quick score check.
 */
const getDSEResult = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "sessionId is required"));
    }

    const session = await DiagnosticSession.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(sessionId) ? sessionId : null },
        { sessionId: sessionId }
      ]
    }).lean();

    if (!session) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Diagnostic session not found"));
    }

    const dseResult = runDSE(session);

    return res
      .status(200)
      .json(new ApiResponse(200, dseResult, "DSE result computed successfully"));
  } catch (error) {
    console.error("[ReportController] getDSEResult error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message || "DSE failed"));
  }
});

/**
 * GET /api/v1/reports/status
 * Query: { hairTestId }
 *
 * Returns the current analysis status and report URL (if available).
 * Used by the frontend for polling / progress display.
 */
const getReportStatus = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "sessionId is required"));
    }

    // Fetch the full document to ensure frontend has all data for UI rendering
    const session = await DiagnosticSession.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(sessionId) ? sessionId : null },
        { sessionId: sessionId }
      ]
    }).lean();

    if (!session) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Diagnostic session not found"));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          sessionId,
          status:             session.analysisStatus || "PENDING",
          pipelineStatus:     session.pipelineStatus || null,
          reportUrl:          session.reportUrl      || null,
          reportGeneratedAt:  session.reportGeneratedAt || null,
          // Include essential metrics for immediate UI display
          hhi:                session.dseResult?.hairHealthIndex || null,
          severity:           session.dseResult?.severity || null,
          urgency:            session.dseResult?.urgency || null,
          compositeConfidence: session.compositeConfidence || null,
          imagesUploaded:     (session.UploadedImage || []).length,
          allImagesReady:     (session.UploadedImage || []).length >= 3,
          skipPhotoAnalysis:  session.skipPhotoAnalysis || false,
          // Returning the full object for custom rendering
          fullData:           session,
        },
        "Report status fetched successfully"
      )
    );
  } catch (error) {
    console.error("[ReportController] getReportStatus error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message || "Status check failed"));
  }
});


/**
 * POST /api/v1/reports/upload-image
 * Multipart: file (image), Body: { hairTestId }
 *
 * Uploads one scalp image (P01/P02/P03) for a hair test.
 * Processes the image: EXIF strip → resize → JPEG → save local or S3.
 * Appends the URL to HairTest.UploadedImage array (max 3 images per PRD).
 */
const uploadScalpImage = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "sessionId is required"));
    }

    // Support 'image', 'file', or 'iage' (typo) for frontend flexibility
    const file = req.file || (req.files && (req.files.image?.[0] || req.files.file?.[0] || req.files.iage?.[0]));

    if (!file) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "No image file uploaded. Field names allowed: 'image', 'file' or 'iage'."));
    }

    const session = await DiagnosticSession.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(sessionId) ? sessionId : null },
        { sessionId: sessionId }
      ]
    });
    if (!session) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Diagnostic session not found"));
    }

    // Enforce max 3 images per PRD §3.1.4
    const currentImages = session.UploadedImage || [];
    if (currentImages.length >= 3) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            {
              currentCount: currentImages.length,
              maxAllowed:   3,
              note:         "P01 (frontal), P02 (crown), P03 (macro close-up) — all 3 slots are filled",
            },
            "Maximum of 3 scalp images allowed per assessment (P01, P02, P03)"
          )
        );
    }

    // Save via StorageService (local JPEG with EXIF stripping)
    const inputBuffer = file.buffer;
    const savedImage = await storageService.saveImage(
      inputBuffer,
      sessionId,
      file.originalname
    );

    // Append to DiagnosticSession.UploadedImage
    session.UploadedImage = [...currentImages, savedImage.url];
    await session.save();

    const photoLabels = ["P01_FRONTAL_HAIRLINE", "P02_VERTEX_CROWN", "P03_MACRO_SCALP"];
    const photoId = photoLabels[currentImages.length] || `P0${currentImages.length + 1}`;
    const allImagesReady = session.UploadedImage.length >= 3;

    console.log(
      `[ReportController] Image uploaded: ${photoId} → ${savedImage.url} (${savedImage.size} bytes). Total: ${session.UploadedImage.length}/3`
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          imageUrl:      savedImage.url,
          fileKey:       savedImage.fileKey,
          fileName:      savedImage.fileName,
          size:          savedImage.size,
          photoId,
          totalImages:   session.UploadedImage.length,
          allImagesReady,
          // Tell frontend whether Vision AI is now available
          visionAIReady: allImagesReady,
          nextAction:    allImagesReady
            ? "All 3 images uploaded. Call POST /api/v1/reports/generate to run the full diagnostic pipeline."
            : `Upload ${3 - session.UploadedImage.length} more image(s) to enable Vision AI analysis.`,
        },
        allImagesReady
          ? "All 3 scalp images uploaded. Ready for full AI analysis."
          : `Image ${session.UploadedImage.length}/3 uploaded successfully`
      )
    );
  } catch (error) {
    console.error("[ReportController] uploadScalpImage error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message || "Image upload failed"));
  }
});

/**
 * GET /api/v1/reports/questions
 *
 * Returns the clinical questionnaire structure (questions and weights) 
 * from the Single Source of Truth (§2.3.2).
 * Frontend uses this to build the UI dynamically.
 */
const getQuestionnaire = asyncHandler(async (req, res) => {
  const scoringWeights = require("../config/scoringWeights.json");
  return res
    .status(200)
    .json(new ApiResponse(200, {
      version: scoringWeights.version,
      lastUpdated: scoringWeights.lastUpdated,
      questions: scoringWeights.questions
    }, "Questionnaire clinical metadata fetched successfully"));
});

module.exports = {
  generateReport,
  getDSEResult,
  getReportStatus,
  getReportResult,
  uploadScalpImage,
  getQuestionnaire,
};
