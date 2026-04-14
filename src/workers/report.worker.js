const { Worker } = require("bullmq");
const { redisConnection } = require("../queues/config");
const { DiagnosticSession } = require("../models/diagnosticSession.model");
const { generateReportPDF } = require("../services/reportGenerator.service");
const storageService = require("../services/storage.service");

/**
 * Stage 7.2 — Report Worker
 * 
 * Implements the asynchronous PDF assembly and S3 upload (§3, §7.2) 
 * for TrichoScan AI.
 * COORDINATOR PATTERN: INPUT → PROCESS → OUTPUT → NEXT STAGE (§12)
 */

const otpGenerator = require("otp-generator");
const Lead = require("../models/lead.model");
const { decryptPII } = require("../utils/security");
const { sendReportOTP } = require("../utils/fast2sms.utils");

const reportWorker = new Worker(
  "report",
  async (job) => {
    const { sessionId } = job.data;
    console.log(`[Worker] [report] GENERATING PDF: ${sessionId}`);

    const session = await DiagnosticSession.findById(sessionId).populate("leadId");
    if (!session) throw new Error(`DiagnosticSession ${sessionId} not found`);

    try {
      // 1. ASSEMBLE DATA & RENDER PDF (HEADLESS NAVIGATION)
      console.log(`[Worker] Step 1: Navigating to frontend print route for ID: ${sessionId}...`);
      
      const pdfBuffer = await generateReportPDF(sessionId);

      // 2. UPLOAD TO STORAGE (§3 & §7.2)
      console.log(`[Worker] Step 2: Uploading to storage...`);
      const storageResult = await storageService.saveReport(pdfBuffer, sessionId);

      // 3. FINALIZATION
      console.log(`[Worker] Step 3: Finalizing session data...`);

      // 4. SAVE STATUS & UPDATE STATE (§5 & §4.6)
      session.reportUrl = storageResult.url;
      session.reportFileKey = storageResult.fileKey;
      session.reportGeneratedAt = new Date();
      
      await session.transitionTo("REPORT_COMPLETE");
      await session.save();

      console.log(`[Worker] Report generation COMPLETE: ${storageResult.url}`);
      return { success: true, url: storageResult.url };
    } catch (err) {
      console.error(`[Worker] [report] ERROR for session ${sessionId}:`, err.message);
      await session.transitionTo("ERROR");
      session.errorMessage = `PDF generation failed: ${err.message}`;
      await session.save();
      throw err; // BullMQ retry §9
    }
  },
  { connection: redisConnection, concurrency: 3 }
);

module.exports = reportWorker;
