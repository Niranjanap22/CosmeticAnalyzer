import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScoreBreakdown } from "@/types/types";
import { checkCompliance } from "./regulatoryService";

const LOW_RISK_INGREDIENTS = [
  "peg-12 dimethicone/ppg-20 crosspolymer",
  "peg 12 dimethicone ppg 20 crosspolymer"
];

const normalizeIngredientName = (name: string): string =>
  (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const isAlwaysLowRiskIngredient = (name: string): boolean => {
  const normalized = normalizeIngredientName(name);
  return LOW_RISK_INGREDIENTS.some((target) => normalized === normalizeIngredientName(target));
};

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
Analyze this cosmetic product image carefully and return structured JSON.

1. Identify the product name and brand.
2. Extract the full ingredient list if visible.
3. Identify any specific toxic or controversial compounds with reasoning.
4. For each ingredient, assign a hazard level: Low, Medium, or High, based on likely reaction/effect on the human body:
   - High: known or strongly suspected carcinogens in bracket specify cancer causing ingredients, mutagens, reproductive toxins, endocrine (hormone) disruptors, persistent bioaccumulative toxins, or ingredients with serious organ/system toxicity.
   - Medium: common allergens/sensitizers/irritants (skin, eye, respiratory), ingredients with moderate evidence of harm, or concentration-dependent risk.
   - Low: generally well-tolerated ingredients with low toxicity evidence in normal cosmetic use.
   If evidence is unclear, choose the more cautious level and mention uncertainty in description.
5. Provide a trust percentage (0–100) and title it as "Confidence in reading product data":
   - 90-100%: Crystal clear label, all ingredients visible, high confidence in accuracy
   - 70-89%: Good image quality, most ingredients visible, minor uncertainty
   - 50-69%: Moderate clarity, some ingredients unclear or partially visible
   - Below 50%: Poor image quality, difficult to read, significant uncertainty
6. Summarize the findings and give a recommendation.

Respond ONLY with valid JSON matching the provided schema.
Do not include explanations outside the JSON.
`;


  const apiKey = process.env.GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("API Key not found. Please checks your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: model,
    contents: [{
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: prompt }
      ]
    }],
    config: {
      temperature: 0, // Force deterministic output
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          trustPercentage: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                purpose: { type: Type.STRING },
                hazardLevel: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "hazardLevel"]
            }
          },
          toxicCompounds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["productName", "trustPercentage", "ingredients"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  // Clean markdown code blocks if present (```json ... ```)
  const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
  
  const result = JSON.parse(cleanText);
  console.log("Gemini AI Output:", JSON.stringify(result, null, 2));

  // Deterministic safety override: this ingredient is always treated as Low risk.
  if (Array.isArray(result.ingredients)) {
    result.ingredients = result.ingredients.map((ing: any) => {
      if (isAlwaysLowRiskIngredient(ing?.name || "")) {
        return {
          ...ing,
          hazardLevel: "Low",
          description:
            ing?.description ||
            "Project rule override: treated as Low risk based on internal safety policy."
        };
      }
      return ing;
    });
  }

  // Calculate ingredient-level base safety score.
  let L = 0, M = 0, H = 0;
  
  if (result.ingredients && Array.isArray(result.ingredients)) {
    result.ingredients.forEach((ing: any) => {
      const level = ing.hazardLevel?.toLowerCase() || "";
      if (level.includes("low")) L++;
      else if (level.includes("medium")) M++;
      else if (level.includes("high")) H++;
    });
  }

  const total = L + M + H;
  const scoreWeights = { low: 0.5, medium: 2.5, high: 5 };
  const totalRisk = (scoreWeights.low * L) + (scoreWeights.medium * M) + (scoreWeights.high * H);
  const maxRisk = 5 * total;
  const baseScore = total > 0 ? (1 - (totalRisk / maxRisk)) * 100 : 0;

  // Keep toxicCompounds consistent with High Risk ingredients.
  // Any ingredient marked High is force-included in toxicCompounds.
  const highRiskIngredientNames: string[] = Array.isArray(result.ingredients)
    ? result.ingredients
        .filter((ing: any) => (ing.hazardLevel || "").toLowerCase().includes("high"))
        .map((ing: any) => (ing.name || "").trim())
        .filter((name: string) => name.length > 0)
    : [];

  const modelToxicCompounds: string[] = Array.isArray(result.toxicCompounds)
    ? result.toxicCompounds
        .map((c: any) => String(c).trim())
        .filter((c: string) => c.length > 0 && !isAlwaysLowRiskIngredient(c))
    : [];

  // Case-insensitive dedupe while preserving first-seen casing.
  const mergedToxicMap = new Map<string, string>();
  [...modelToxicCompounds, ...highRiskIngredientNames].forEach((name) => {
    const key = name.toLowerCase();
    if (!mergedToxicMap.has(key)) mergedToxicMap.set(key, name);
  });
  const mergedToxicCompounds = Array.from(mergedToxicMap.values());

  // Run Regulatory Compliance Checks
  const ingredientNames = result.ingredients ? result.ingredients.map((i: any) => i.name) : [];
  const compliance = checkCompliance(ingredientNames);

  const penaltyWeights = {
    fda: 8,
    eu: 6,
    carcinogen: 5,
    endocrine: 4,
    allergen: 2
  };

  const penalties: ScoreBreakdown["penalties"] = {
    fda: {
      count: compliance.fda.issues.length,
      weight: penaltyWeights.fda,
      total: compliance.fda.issues.length * penaltyWeights.fda
    },
    eu: {
      count: compliance.eu.issues.length,
      weight: penaltyWeights.eu,
      total: compliance.eu.issues.length * penaltyWeights.eu
    },
    carcinogen: {
      count: compliance.carcinogens.issues.length,
      weight: penaltyWeights.carcinogen,
      total: compliance.carcinogens.issues.length * penaltyWeights.carcinogen
    },
    endocrine: {
      count: compliance.endocrine.issues.length,
      weight: penaltyWeights.endocrine,
      total: compliance.endocrine.issues.length * penaltyWeights.endocrine
    },
    allergen: {
      count: compliance.allergens.issues.length,
      weight: penaltyWeights.allergen,
      total: compliance.allergens.issues.length * penaltyWeights.allergen
    }
  };

  const totalPenalty =
    penalties.fda.total +
    penalties.eu.total +
    penalties.carcinogen.total +
    penalties.endocrine.total +
    penalties.allergen.total;

  const rawScore = Number((baseScore - totalPenalty).toFixed(2));
  const finalScore = Number(Math.max(0, Math.min(100, rawScore)).toFixed(2));

  const scoreBreakdown: ScoreBreakdown = {
    ingredientCounts: {
      low: L,
      medium: M,
      high: H,
      total
    },
    baseScore: Number(baseScore.toFixed(2)),
    penalties,
    totalPenalty: Number(totalPenalty.toFixed(2)),
    rawScore,
    clampedScore: finalScore,
    finalScore
  };

  return {
    ...result,
    toxicCompounds: mergedToxicCompounds,
    overallSafetyScore: finalScore,
    fdaCompliance: compliance.fda,
    euCompliance: compliance.eu,
    carcinogenStatus: compliance.carcinogens,
    allergenStatus: compliance.allergens,
    endocrineStatus: compliance.endocrine,
    scoreBreakdown
  };
};
