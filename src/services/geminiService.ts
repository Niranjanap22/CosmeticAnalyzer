import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "@/types/types";
import { checkCompliance } from "./regulatoryService";

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
Analyze this cosmetic product image carefully and return structured JSON.

1. Identify the product name and brand.
2. Extract the full ingredient list if visible.
3. Identify any specific toxic or controversial compounds.
4. For each ingredient, assign a hazard level: Low, Medium, or High.
5. Provide a trust percentage (0–100) based on these criteria also give title as Confidence in reading product data:
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
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: prompt }
      ]
    },
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
  
  const result = JSON.parse(text.trim());
  console.log("Gemini AI Output:", JSON.stringify(result, null, 2));

  // Calculate the Overall Safety Score deterministically
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
  let safetyScore = 0;

  if (total > 0) {
    const totalRisk = (1 * L) + (3 * M) + (5 * H);
    const maxRisk = 5 * total;
    safetyScore = (1 - (totalRisk / maxRisk)) * 100;
  }

  // Run Regulatory Compliance Checks
  const ingredientNames = result.ingredients ? result.ingredients.map((i: any) => i.name) : [];
  const compliance = checkCompliance(ingredientNames);

  return {
    ...result,
    overallSafetyScore: Number(safetyScore.toFixed(2)),
    fdaCompliance: compliance.fda,
    euCompliance: compliance.eu
  };
};
