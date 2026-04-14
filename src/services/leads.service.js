const User = require("../models/user.model");

/**
 * TrichoScan AI — Lead Generation & Qualifying Intelligence
 * 
 * Implements PRD §1.2 & §7.1: Converts diagnostic results into 
 * actionable leads for the medical/sales team.
 */
class LeadService {
  /**
   * Qualifies a patient as a lead based on their DSE and Vision results.
   * 
   * PRIORITY LOGIC (per PRD §7.1):
   * - URGENT/HIGH Urgency → "HOT LEAD" (Immediate Outreach)
   * - SEVERE/SIGNIFICANT Severity → "HIGH PRIORITY"
   * - HHI < 35 → "CRITICAL"
   */
  async qualifyAndSaveLead(userId, dseResult, visionAnalysis) {
    try {
      if (!userId) return;

      const { hairHealthIndex, severityBand, urgencyFlag, primaryConditions } = dseResult;
      
      // Lead Scoring Algorithm
      let priorityScore = 0;
      let tags = [];

      // 1. Urgency Weight
      if (urgencyFlag === "URGENT") { priorityScore += 50; tags.push("HOT_LEAD"); }
      else if (urgencyFlag === "HIGH") { priorityScore += 30; tags.push("HIGH_PRIORITY"); }

      // 2. Severity Weight
      if (severityBand === "SEVERE") { priorityScore += 30; tags.push("CRITICAL_CONDITION"); }
      else if (severityBand === "SIGNIFICANT") { priorityScore += 15; }

      // 3. Condition Specific Tags
      if (primaryConditions.includes("SA")) tags.push("SURGICAL_INTERVENTION");
      if (primaryConditions.includes("CA")) tags.push("CANCER_FOLLOWUP");
      
      // 4. Vision Confidence Check
      if (visionAnalysis?.compositeConfidence?.score > 85) {
        tags.push("VERIFIED_BY_AI");
      }

      const leadCategory = this._getLeadCategory(priorityScore);

      // Update User document as a qualified lead
      await User.findByIdAndUpdate(userId, {
        $set: {
          "leadMetadata.lastDiagnosticCategory": leadCategory,
          "leadMetadata.lastHHI": hairHealthIndex,
          "leadMetadata.priorityScore": priorityScore,
          "leadMetadata.tags": tags,
          "leadMetadata.isQualified": true,
          "leadMetadata.lastAssessmentAt": new Date(),
          status: true // Ensure user is active
        }
      });

      console.log(`[LeadService] User ${userId} qualified as ${leadCategory} (Score: ${priorityScore}). Tags: ${tags.join(", ")}`);
    } catch (error) {
      console.error("[LeadService] Qualification error:", error.message);
    }
  }

  _getLeadCategory(score) {
    if (score >= 80) return "HOT_LEAD";
    if (score >= 50) return "WARM_LEAD";
    if (score >= 20) return "COLD_LEAD";
    return "ORGANIC_NURTURE";
  }
}

module.exports = new LeadService();
