const { Worker } = require("bullmq");
const { redisConnection, reportQueue } = require("../queues/config");
const { DiagnosticSession } = require("../models/diagnosticSession.model");
const { runDSE } = require("../services/dse.service");
const { analyseAllScalpImages, generateClinicalNarrativeAnthropic } = require("../services/claude.service");
const { mapDSEToReport } = require("../utils/reportTransformer");

/**
 * TrichoScan AI — Analysis Worker (Hardened v2)
 * 
 * Implements §7.1 (Analysis Worker) and §1.2 (Flow Logic) of prd.md.
 * HARDENED: DSE → Vision → Treatment → Prediction (Gap #6)
 */

const analysisWorker = new Worker(
  "analysis",
  async (job) => {
    const { sessionId } = job.data;
    const session = await DiagnosticSession.findOne({ sessionId });
    
    if (!session) throw new Error(`Session ${sessionId} not found for job ${job.id}`);

    console.log(`[AnalysisWorker] [${job.id}] STARTING pipeline for ${sessionId}...`);
    
    try {
      await session.transitionTo("ANALYSIS_IN_PROGRESS");

      // ── STAGE 1: DSE (REQUIRED) ───────────────────────────────────
      console.log(`[AnalysisWorker] [${job.id}] STAGE 1: Running DSE...`);
      const dseResult = runDSE(session);
      session.dseResult = dseResult;
      session.pipelineStatus.dse = "COMPLETE";
      await session.save(); // FLUSH STAGE 1

      // ── STAGE 2: VISION AI (CONDITIONAL) ──────────────────────────
      if (session.UploadedImage.length >= 3 && !session.skipPhotoAnalysis) {
        try {
          console.log(`[AnalysisWorker] [${job.id}] STAGE 2: Dispatching Claude Vision...`);
          const visionResult = await analyseAllScalpImages(session.UploadedImage, dseResult, session);
          session.visionAnalysis = visionResult.visionResult;
          session.visionAdjustedScores = visionResult.adjustedScores;
          session.compositeConfidence = visionResult.compositeConfidence;
          session.pipelineStatus.vision = "COMPLETE";
        } catch (visionError) {
          console.error(`[AnalysisWorker] [${job.id}] ⚠️ Vision Failed (DSE Fallback Mode):`, visionError.message);
          session.pipelineStatus.vision = "FAILED_DEGRADED_TO_DSE_ONLY"; // Gap #8
        }
        await session.save(); // FLUSH STAGE 2
      } else {
        session.pipelineStatus.vision = "SKIPPED_INSUFFICIENT_IMAGES";
        session.skipPhotoAnalysis = true;
        
        // Compute DSE-only confidence
        const { computeCompositeConfidence } = require("../services/claude.service");
        session.compositeConfidence = computeCompositeConfidence(dseResult, null);
      }

      // ── STAGE 3: TREATMENT RECOMMENDATION ENGINE (gap.md §7) ──────────
      console.log(`[AnalysisWorker] [${job.id}] STAGE 3: Building Treatment Plan...`);
      const topCode = (dseResult.conditions?.[0]?.code) || "AGA";
      
      const phase1 = [
        { name: "Clinical Stabilization", type: "therapy", duration: "Months 1-3", priority: 1, task: "Reduce acute shedding." },
        { name: "Inflammation Control", type: "topical", duration: "Months 1-3", priority: 1, task: "Apply prescribed serums nightly." }
      ];
      if (dseResult.urgencyFlag === "HIGH") {
        phase1.unshift({ name: "Dermatologist Consultation", type: "therapy", duration: "Immediate", priority: 0, task: "In-person clinical verification required." });
      }

      const phase2 = [
        { name: "Regrowth Induction", type: "therapy", duration: "Months 4-6", priority: 1, task: "Activate dormant follicles." },
        { name: "Nutritional Consolidation", type: "lifestyle", duration: "Months 4-6", priority: 2, task: "Optimize protein & mineral intake." }
      ];

      const phase3 = [
        { name: "Maintenance Protocol", type: "topical", duration: "Months 7-12", priority: 1, task: "Long-term follicular shielding." },
        { name: "Semi-Annual Review", type: "therapy", duration: "Month 12", priority: 2, task: "Progress audit." }
      ];

      session.treatmentPlan = { phase1, phase2, phase3 };
      session.treatmentRecommendations = { 
        priority: dseResult.urgencyFlag,
        recommendedTherapies: phase1.map(t => t.name)
      };
      session.pipelineStatus.treatment = "COMPLETE";
      await session.save(); // FLUSH STAGE 3

      // ── STAGE 4: CLINCAL NARRATIVE (Claude 3.5 Refiner) ────────────────────────
      console.log(`[AnalysisWorker] [${job.id}] STAGE 4: Generating Clinical Narrative...`);
      try {
        // 4.1 Generate Mapper Shell (Pure Truth)
        const mapperShell = mapDSEToReport({ ...session, dseResult }, { withPhotoAnalysis: session.pipelineStatus.vision === "COMPLETE" });

        // 4.2 AI Refinement (Only if Photos are present, per user request v12.1)
        if (session.pipelineStatus.vision === "COMPLETE") {
          const isUpgrade = session.clinicalNarrative;
          
          if (isUpgrade) {
            console.log(`[AnalysisWorker] [${job.id}] Upgrade Pass: Refinement restricted to Vision sections only.`);
            const fullShell = mapperShell;
            const visionOnlyShell = {
              aiAnalysisInsightRows: fullShell.aiAnalysisInsightRows,
              shaftScalpInsightCards: fullShell.shaftScalpInsightCards,
              regionalZones: fullShell.regionalZones,
              clinicalDimensions: fullShell.clinicalDimensions
            };
            
            const visionRefinement = await generateClinicalNarrativeAnthropic(
              visionOnlyShell, 
              dseResult, 
              session.answers
            );
            
            const { mergeRefinements } = require("../utils/reportTransformer");
            refinedNarrative = mergeRefinements(session.clinicalNarrative, visionRefinement || {});
          } else {
            refinedNarrative = await generateClinicalNarrativeAnthropic(
              mapperShell,
              dseResult,
              session.answers
            );
          }
        } else {
          console.log(`[AnalysisWorker] [${job.id}] Stage 4 SKIPPED (DSE-Only mode — using deterministic shell)`);
          refinedNarrative = mapperShell; // No AI call for non-photo reports
        }

        session.clinicalNarrative = refinedNarrative;
        session.pipelineStatus.narrative = "COMPLETE";
      } catch (narrativeError) {
        if (narrativeError.message && (narrativeError.message.includes("529") || narrativeError.message.includes("429"))) {
          throw narrativeError; 
        }

        console.warn(`[AnalysisWorker] [${job.id}] ⚠️ Narrative AI Failed: ${narrativeError.message}. Using basic shell.`);
        session.clinicalNarrative = mapDSEToReport(session);
        session.pipelineStatus.narrative = "FAILED_USING_DSE_SUMMARY";
      }

      // 🛡️ PRD §1.2 FLOW LOCK 🛡️
      await session.transitionTo("ANALYSIS_COMPLETE");
      
      // Upgrade Flow: If user already verified, auto-refresh the PDF
      if (session.isVerified) {
        console.log(`[AnalysisWorker] [${job.id}] Auto-triggering report refresh for verified session...`);
        await session.transitionTo("REPORT_QUEUED");
        await reportQueue.add("build-pdf", { sessionId: session._id }, { 
          attempts: 3, 
          backoff: { type: "exponential", delay: 3000 }
        });
      }

      console.log(`[AnalysisWorker] [${job.id}] ✅ Pipeline SUCCESS — Waiting for Lead Capture.`);
      
    } catch (error) {
      console.error(`[AnalysisWorker] [${job.id}] ❌ TERMINAL FAILURE:`, error.message);
      session.errorMessage = error.message;
      await session.transitionTo("ERROR"); // Gap #9
      throw error; // Let BullMQ handle max retries (Gap #8)
    }
  },
  { 
     connection: redisConnection,
     limiter: { max: 10, duration: 1000 } // Rate limit protection (§6.4)
  }
);

analysisWorker.on("failed", (job, err) => {
  console.error(`[AnalysisWorker] Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`);
});

module.exports = { analysisWorker };
