// app/utils/allergyRiskEngine.js

export function evaluateAllergyRisk({
  symptoms = [],
  gender,
  familyHistory,
  previousReaction,
  foodType,
  medicalConditions = [],
  severityScore = 0,
}) {
  let score = 0;
  const reasons = [];

  /* ---------------- SYMPTOMS ---------------- */

  const symptomWeights = {
    "Breathing issues": 6,
    "Swelling": 5,
    "Hives": 4,
    "Skin rash": 3,
    "Nausea": 2,
    "Vomiting": 2,
    "Diarrhea": 2,
  };

  symptoms.forEach(symptom => {
    if (symptomWeights[symptom]) {
      score += symptomWeights[symptom];
      reasons.push(`Symptom reported: ${symptom}`);
    }
  });

  /* ---------------- PREVIOUS REACTION ---------------- */

  const reactionWeights = {
    "None": 0,
    "Mild": 2,
    "Moderate": 4,
    "Severe": 6,
  };

  score += reactionWeights[previousReaction] || 0;

  if (previousReaction !== "None") {
    reasons.push(`Previous reaction: ${previousReaction}`);
  }

  /* ---------------- FAMILY HISTORY ---------------- */

  if (familyHistory === "Yes") {
    score += 3;
    reasons.push("Family history of allergies");
  }

  /* ---------------- FOOD TYPE ---------------- */

  const foodRisk = {
    "Nuts": 5,
    "Peanuts": 5,
    "Shellfish": 5,
    "Seafood": 4,
    "Dairy": 3,
    "Eggs": 3,
    "Gluten": 2,
  };

  if (foodRisk[foodType]) {
    score += foodRisk[foodType];
    reasons.push(`High-risk food: ${foodType}`);
  }

  /* ---------------- MEDICAL CONDITIONS ---------------- */

  medicalConditions.forEach(cond => {
    if (cond === "Asthma") {
      score += 3;
      reasons.push("Asthma increases allergy severity");
    }
    if (cond === "Eczema") {
      score += 2;
      reasons.push("Eczema associated with allergies");
    }
  });

  /* ---------------- SEVERITY SCORE ---------------- */

  score += Math.min(severityScore, 10);

  if (severityScore >= 7) {
    reasons.push("High symptom severity");
  }

  /* ---------------- FINAL CLASSIFICATION ---------------- */

  let risk = "Low";
  if (score >= 15) risk = "High";
  else if (score >= 8) risk = "Medium";

  return {
    allergic: risk !== "Low",
    risk,
    score,
    confidence: Math.min(score / 20, 1).toFixed(2),
    reasons,
  };
}
