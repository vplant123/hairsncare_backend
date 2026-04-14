const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { DiagnosticSession } = require("../models/diagnosticSession.model");
const { Lead } = require("../models/lead.model");
const moment = require("moment");
const storageService = require("./storage.service");
const projectRoot = path.resolve(__dirname, "../../").replace(/\\/g, "/");

// ─── HANDLEBARS HELPERS ───────────────────────────────────────────────────────
handlebars.registerHelper('gt', function(a, b) { return a > b; });
handlebars.registerHelper('lt', function(a, b) { return a < b; });
handlebars.registerHelper('eq', function(a, b) { return a === b; });
handlebars.registerHelper('ne', function(a, b) { return a !== b; });
handlebars.registerHelper('gte', function(a, b) { return a >= b; });
handlebars.registerHelper('lte', function(a, b) { return a <= b; });
handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('and', function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(Boolean);
});
handlebars.registerHelper('or', function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(Boolean);
});

// ─── PDF REPORT GENERATOR SERVICE — HANDLEBARS v1.0 ───────────────────────────

/**
 * Generates a complete PDF report using Handlebars and Puppeteer.
 * 
 * PRD §4.2: Headless Digital Dossier Generation
 * @param {string} sessionMongoId - The MongoDB _id of the session.
 * @returns {Buffer} - The generated PDF buffer.
 */
async function generateReportPDF(sessionMongoId) {
  let browser = null;
  try {
    const session = await DiagnosticSession.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(sessionMongoId) ? sessionMongoId : null },
        { sessionId: sessionMongoId }
      ]
    }).populate("leadId");
    
    if (!session) {
      throw new Error(`[ReportGenerator] CRITICAL: Session ${sessionMongoId} not found in DB.`);
    }

    const templatePath = path.join(__dirname, "../templates/report.hbs");
    if (!fs.existsSync(templatePath)) throw new Error(`Template not found at ${templatePath}`);

    const templateSource = fs.readFileSync(templatePath, "utf-8");

    const template = handlebars.compile(templateSource);

    // Prepare data
    const data = await prepareReportData(session, `file:///${projectRoot}/`);
    data.baseUrl = `file:///${projectRoot}/`;


    const html = template(data);

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });

    // Set content directly
    await page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: 60000 
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }, // HHI template usually has its own margins
    });

    console.log(`[ReportGenerator] ✅ PDF capture success: ${pdfBuffer.length} bytes`);
    return pdfBuffer;

  } catch (error) {
    console.error("[ReportGenerator] ❌ PDF generation error:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const { mapDSEToReport, mergeRefinements } = require("../utils/reportTransformer");

/**
 * Maps raw Session data to Handlebars template variables.
 */
async function prepareReportData(session, pdfBaseUrl = null) {
  // Use the production transformer to generate exactly what the UI sees
  const mapped = mapDSEToReport(session, { 
    fullReport: true,
    withPhotoAnalysis: session.skipPhotoAnalysis === false 
  });
  
  // Merge AI refinements if they exist (Narrative Logic)
  let finalized = mapped;
  if (session.clinicalNarrative) {
    finalized = mergeRefinements(mapped, session.clinicalNarrative);
  }

  // Inject PDF-specific fixes (Base URLs)
  const photos = session.UploadedImage || [];
  
  // ── IMAGE EMBEDDING (BASE64) ─────────────────────────────────────────────
  // We fetch from S3 and convert to Base64 so Puppeteer doesn't have 
  // to make external network requests during PDF rendering.
  const photoBase64 = {
    photoFront: null,
    photoCrown: null,
    photoLeft: null,
    photoRight: null
  };

  if (!session.skipPhotoAnalysis && photos.length > 0) {
    const keys = ["photoFront", "photoCrown", "photoLeft", "photoRight"];
    for (let i = 0; i < photos.length && i < 4; i++) {
       try {
         const buffer = await storageService.getFileBuffer(photos[i]);
         photoBase64[keys[i]] = `data:image/jpeg;base64,${buffer.toString("base64")}`;
       } catch (err) {
         console.warn(`[ReportGenerator] Failed to embed image ${i}: ${err.message}`);
       }
    }
  }

  // ── TEMPLATE IMAGES EMBEDDING (BASE64) — CACHED SINGLETON ────────────────
  // Optimization: Read static assets from disk ONLY ONCE and keep in memory.
  // This prevents blocking I/O on every single PDF generation.
  if (!global._staticReportImageCache) {
    console.log("[ReportGenerator] Initializing static image cache...");
    const cache = {};
    const staticFolder = path.join(__dirname, "../templates/report-image");
    
    if (fs.existsSync(staticFolder)) {
      const files = fs.readdirSync(staticFolder);
      files.forEach(file => {
        try {
          const filePath = path.join(staticFolder, file);
          const buffer = fs.readFileSync(filePath);
          const mime = file.endsWith(".png") ? "image/png" : "image/jpeg";
          const key = `static_${file.replace(/[-.]/g, "_")}`;
          cache[key] = `data:${mime};base64,${buffer.toString("base64")}`;
        } catch (err) {
          console.warn(`[ReportGenerator] Failed to cache static image ${file}: ${err.message}`);
        }
      });
    }
    global._staticReportImageCache = cache;
  }
  const staticImages = global._staticReportImageCache;

  // ── DYNAMIC IMAGE RESOLUTION ─────────────────────────────────────────────
  // Resolve imageSource keys into actual base64 strings for the template
  if (finalized.nutritionalProtocolCards?.items) {
    finalized.nutritionalProtocolCards.items.forEach(card => {
      if (card.imageSource && staticImages[card.imageSource]) {
        card.image = staticImages[card.imageSource];
      }
    });
  }
  
  // Resolve Treatment Phases
  if (finalized.personalisedTreatmentPhases?.items) {
    finalized.personalisedTreatmentPhases.items.forEach(phase => {
      if (phase.imageSource && staticImages[phase.imageSource]) {
        phase.image = staticImages[phase.imageSource];
      }
    });
  }

  // Resolve Treatment Recommendations
  if (finalized.treatmentRecommendationRows?.items) {
    finalized.treatmentRecommendationRows.items.forEach(row => {
      if (row.imageSource && staticImages[row.rowImageSource || row.imageSource]) {
        row.image = staticImages[row.rowImageSource || row.imageSource];
      }
    });
  }

  // Resolve Medical Review Doctor Image
  if (finalized.medicalReview && finalized.medicalReview.imageSource) {
    if (staticImages[finalized.medicalReview.imageSource]) {
      finalized.medicalReview.doctorImage = staticImages[finalized.medicalReview.imageSource];
    }
  }

  // Backward compatibility & PDF Engine specific fields
  const final = {
    ...finalized,
    baseUrl: pdfBaseUrl,
    
    // Base64 Embedded Images (User Uploads)
    ...photoBase64,

    // Base64 Embedded Images (Template Assets)
    ...staticImages,
    
    // Safety fallback for medicalReview if missing
    medicalReview: finalized.medicalReview || {
      doctorName: "Dr. Arvind Poswal",
      doctorQualification: "MBBS, Hair Transplant Surgeon",
      doctorTitle: "Medical Director, Hairsncare",
      experienceHeadline: "15+ Years Clinical Excellence",
      reviewBody: "Assessment based on clinical diagnostic markers and AI-assisted follicle analysis.",
      casesReviewed: "50,000+",
      yearsExperience: "15+"
    }
  };

  // 🛡️ PDF ENGINE SYNC: Inject Base64 strings into the aiPhotoTiles items 
  // so the '{{#each}}' loop in the template can render them from local memory.
  if (final.aiPhotoTiles?.items) {
    const pKeys = ["photoFront", "photoCrown", "photoLeft", "photoRight"];
    final.aiPhotoTiles.items.forEach((item, idx) => {
      if (idx < pKeys.length && photoBase64[pKeys[idx]]) {
        item.image = photoBase64[pKeys[idx]];
      }
    });
  }

  // Also sync the standalone Crown image
  if (photoBase64.photoCrown) {
    final.photoCrown = photoBase64.photoCrown;
  }

  return final;
}

function getHHIStatus(hhi) {
  if (hhi >= 75) return "Good Hair Health";
  if (hhi >= 40) return "Moderate Concern";
  return "High Risk / Poor Health";
}

function getHHIStanding(hhi) {
  if (hhi >= 90) return "Top 10%";
  if (hhi >= 75) return "Top 25%";
  return "Average Standing";
}

function getHHISummaryText(hhi) {
    if (hhi >= 75) return "generally healthy hair requiring preventive monitoring";
    if (hhi >= 40) return "active hair thinning that requires clinical intervention";
    return "significant hair loss progression requiring urgent trichology consultation";
}

module.exports = {
  generateReportPDF,
  prepareReportData
};