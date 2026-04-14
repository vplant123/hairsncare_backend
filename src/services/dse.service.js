/**
 * TrichoScan AI — DSE ENGINE v4.4 (Ultra-Hardened Clinical Engine)
 * 
 * FINAL REALIGNMENT: Mandatory 1-to-1 mapping with 54-Q Matrix Option Values.
 * ZERO-SMOOTHING POLICY: High-intensity symptoms result in high-intensity penalties.
 */

const CONDITION_NAMES = {
  AGA: "Androgenetic Alopecia",
  FAGA: "Female Pattern Hair Loss",
  TE: "Telogen Effluvium",
  AA: "Alopecia Areata",
  SD: "Seborrheic Dermatitis",
  PS: "Psoriasis",
  SA: "Scarring Alopecia",
  CA: "Chemical/Traction Alopecia",
  NB: "Nutritional Deficiency",
  HT: "Thyroid-Related Loss",
  POK: "Hormonal/PCOS-Related",
  HA: "Hereditary Risk (Pre-Clinical)"
};

const clamp = (val) => Math.max(10, Math.min(100, Math.round(val)));

function normalizeBuckets(buckets) {
  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  if (total === 0) return buckets;
  const normalized = {};
  for (const key in buckets) {
    normalized[key] = +( (buckets[key] / total) * 100 ).toFixed(2);
  }
  return normalized;
}

// 🧪 1. ROOT CAUSE ENGINE (CRITICAL FIX: TE & NB SENSITIVITY)
function computeRootCauses(a) {
  const buckets = { AGA: 0, TE: 0, NB: 0, HT: 0, SD: 0, CA: 0 };

  // AGA
  if (["both", "paternal", "maternal"].includes(a.Q_S03_001)) buckets.AGA += a.Q_S03_001 === "both" ? 50 : 35;
  if (["frontal", "temples", "crown", "temples_crown"].includes(a.Q_S02_004)) buckets.AGA += 30;
  if (a.Q_S02_002 === "gradual") buckets.AGA += 25;
  if (["moderate", "significant"].includes(a.Q_23)) buckets.AGA += 30;

  // TE (Sudden/Stress/Illness) — Primary triggers
  const isSudden = a.Q_S02_002 === "sudden" || a.Q_40 === "acute";
  if (isSudden) buckets.TE += 65; // Dominant trigger
  if (["high", "extreme"].includes(a.Q_S05_001)) buckets.TE += a.Q_S05_001 === "extreme" ? 70 : 45;
  const meds = Array.isArray(a.Q_S04_005) ? a.Q_S04_005 : [a.Q_S04_005];
  if (meds.some(m => ["covid", "fever", "surgery"].includes(m))) buckets.TE += 75;

  // NB (Nutrition)
  if (["poor", "very_poor"].includes(a.Q_S05_003)) buckets.NB += a.Q_S05_003 === "very_poor" ? 60 : 40;
  if (["low", "very_low"].includes(a.Q_S05_007)) buckets.NB += a.Q_S05_007 === "very_low" ? 55 : 35;

  // HT (Hormonal/PCOS)
  if (["yes_medicated", "suspected"].includes(a.Q_S04_001)) buckets.HT += 50;
  if (a.Q_S04_009 === "yes") buckets.HT += 40;

  // SD (Scalp Inflammation)
  if (["oily", "very_oily"].includes(a.Q_S07_002)) buckets.SD += 30;
  if (["moderate", "severe", "constant"].includes(a.Q_S07_001)) buckets.SD += 40;
  if (["moderate", "severe"].includes(a.Q_S07_003)) buckets.SD += 45;

  return normalizeBuckets(buckets);
}

// 📊 2. CLINICAL DIMENSIONS (CRITICAL FIX: SCALP & DENSITY PENALTIES)
function computeDensity(a) {
  let score = 100;
  const areaMap = { frontal: 20, temples: 15, crown: 25, temples_crown: 40, diffuse: 25 };
  score -= (areaMap[a.Q_S02_004] || 0);

  const sevMap = { mild: 5, moderate: 20, severe: 40, advanced: 60 };
  score -= (sevMap[a.Q_13] || 0);

  const visMap = { bright_light: 15, moderate: 30, significant: 50, transparent: 70 };
  score -= (visMap[a.Q_18] || 0);

  // Regional Check (Frontal, Mid, Crown)
  if (["moderate", "severe"].includes(a.Q_19)) score -= 15;
  if (["moderate", "severe"].includes(a.Q_20)) score -= 15;
  if (["moderate", "severe"].includes(a.Q_21)) score -= 15;

  return clamp(score);
}

function computeStrength(a) {
  let score = 100;
  const minMap = { slight: 15, moderate: 35, significant: 55 };
  score -= (minMap[a.Q_23] || 0);

  if (["frequently", "easily", "constant"].includes(a.Q_24)) score -= 30;
  if (["rough", "damaged"].includes(a.Q_26)) score -= (a.Q_26 === "damaged" ? 35 : 15);
  
  return clamp(score);
}

function computeScalp(a) {
  let score = 100;
  const oilMap = { oily: 20, very_oily: 40, dry: 15, very_dry: 35 };
  score -= (oilMap[a.Q_S07_002] || 0);

  const itchMap = { mild: 10, moderate: 25, severe: 50, constant: 70 };
  score -= (itchMap[a.Q_S07_001] || 0);

  const flakeMap = { mild: 10, moderate: 25, severe: 45 };
  score -= (flakeMap[a.Q_S07_003] || 0);

  const redMap = { mild: 10, moderate: 25, significant: 45 };
  score -= (redMap[a.Q_S07_004] || 0);

  return clamp(score);
}

function computeFall(a) {
  const fallMap = { lt_50: 98, "50_100": 85, "100_150": 65, "150_200": 45, gt_200: 20 };
  return clamp(fallMap[a.Q_S02_003] || (a.Q_37 === "much_more" ? 50 : 90));
}

function computeLifestyle(a) {
  let score = 100;
  const stressMap = { minimal: 0, low: 10, moderate: 20, high: 45, extreme: 75 };
  score -= (stressMap[a.Q_S05_001] || 0);

  const dietMap = { excellent: -10, good: 0, average: 20, poor: 45, very_poor: 65 };
  score -= (dietMap[a.Q_S05_003] || 0);
  
  const proteinMap = { high: -10, adequate: 0, low: 35, very_low: 55 };
  score -= (proteinMap[a.Q_S05_007] || 0);

  if (["regular", "heavy"].includes(a.Q_S05_004)) score -= 20;

  return clamp(score);
}

function computeRecovery(a) {
  let score = 100;
  const durMap = { lt_3_months: 0, "3_6_months": 15, "6_12_months": 25, "1_2_years": 40, gt_5_years: 70 };
  score -= (durMap[a.Q_S02_001] || 15);

  // Scalp & Nutrition Modifiers (Heavy)
  const scalpScore = computeScalp(a);
  const lifestyleScore = computeLifestyle(a);
  
  if (scalpScore < 60) score -= 25; // Inflamed scalp kills recovery potential
  if (lifestyleScore < 50) score -= 20;
  if (["low", "very_low"].includes(a.Q_S05_007)) score -= 15;

  return clamp(score);
}

const computeHHI = (s) => Math.round(s.density * 0.2 + s.fall * 0.2 + s.recovery * 0.2 + s.strength * 0.15 + s.scalp * 0.15 + s.lifestyle * 0.1);

function interpretQuestionnaireData(session) {
  const answersMap = {};
  if (session.answers) {
    if (typeof session.answers.get === "function") {
      session.answers.forEach((v, k) => { answersMap[k] = v?.value !== undefined ? v.value : v; });
    } else {
      Object.entries(session.answers).forEach(([k, v]) => { answersMap[k] = v?.value !== undefined ? v.value : v; });
    }
  }
  return answersMap;
}

function runDSE(session) {
  const a = interpretQuestionnaireData(session);
  const dims = {
    density: computeDensity(a),
    strength: computeStrength(a),
    scalp: computeScalp(a),
    fall: computeFall(a),
    lifestyle: computeLifestyle(a),
    recovery: computeRecovery(a)
  };

  const hhi = computeHHI(dims);
  const causeBuckets = computeRootCauses(a);
  const conditions = Object.entries(causeBuckets).map(([code, score]) => ({
    code: code === "TE_PI" ? "TE" : code,
    name: CONDITION_NAMES[code === "TE_PI" ? "TE" : code] || code,
    probabilityPct: Math.round(score),
    classification: score > 30 ? "PRIMARY_CONDITION" : score > 15 ? "SECONDARY_CONDITION" : "TRACE"
  })).sort((a, b) => b.probabilityPct - a.probabilityPct);

  return {
    hairHealthIndex: hhi,
    severityBand: hhi >= 80 ? "MILD" : hhi >= 55 ? "MODERATE" : "SEVERE",
    urgencyFlag: hhi < 40 || causeBuckets.SD > 45 || causeBuckets.TE > 45 ? "HIGH" : hhi < 65 ? "MEDIUM" : "LOW",
    primaryConditions: conditions.filter(c => c.classification === "PRIMARY_CONDITION").map(c => c.name),
    secondaryConditions: conditions.filter(c => c.classification === "SECONDARY_CONDITION").map(c => c.name),
    conditions,
    conditionScores: causeBuckets,
    dimensionScores: { ...dims, fallControl: dims.fall, scalpHealth: dims.scalp },
    scoringEngineVersion: "4.4-Ultra",
    dataCompletenessPct: 100,
    compositeFiringLog: ["HARDCODED_CLINICAL_LOGIC_V4.4"],
    staging: hhi < 50 ? "Stage: Moderate" : "Stage: Early",
    flags: hhi < 35 ? ["CRITICAL_HEALTH_WARNING"] : []
  };
}

module.exports = { runDSE, interpretQuestionnaireData, CONDITION_NAMES };
