const express = require("express");
const multer = require("multer");

const {
  generateReport,
  getDSEResult,
  getReportStatus,
  getReportResult,
  uploadScalpImage,
  getQuestionnaire,
} = require("../controllers/report.controller");

const { verifyJwt } = require("../middlewares/auth.middleware");

const router = express.Router();

// ─── MULTER: Using centralized memory storage for v12.0 pipeline ──────────
const { memoryUpload: imageUpload } = require("../middlewares/multer.middleware");


// ─── REPORT ROUTES ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/reports/questions
 * Public access for dynamic form building.
 */
router.get("/questions", getQuestionnaire);

/**
 * POST /api/v1/reports/upload-image
 * Body (multipart): image, sessionId
 */
router.post(
  "/upload-image",
  // verifyJwt,
  imageUpload.fields([
    { name: "image", maxCount: 1 }, 
    { name: "file", maxCount: 1 },
    { name: "iage", maxCount: 1 }
  ]),
  uploadScalpImage
);

/**
 * POST /api/v1/reports/generate
 * Body: { sessionId }
 */
router.post("/generate", /* verifyJwt, */ generateReport);

/**
 * GET /api/v1/reports/dse
 * Query: { sessionId }
 */
router.get("/dse", /* verifyJwt, */ getDSEResult);

/**
 * GET /api/v1/reports/status
 * Query: { sessionId }
 */
router.get("/status", /* verifyJwt, */ getReportStatus);

/**
 * GET /api/v1/reports/result
 * Query: { sessionId }
 */
router.get("/result", /* verifyJwt, */ getReportResult);

module.exports = router;
