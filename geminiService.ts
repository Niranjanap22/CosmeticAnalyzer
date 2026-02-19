import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

// GoogleGenAI initialization moved inside the function to prevent startup crashes if API key is missing

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  // Use gemini-3-flash-preview as it's a capable multimodal model for this task.
  const model = 'gemini-3-flash-preview';

  const prompt = `
Analyze this cosmetic product image carefully and return structured JSON.

1. Identify the product name and brand.
2. Extract the full ingredient list if visible.
3. Identify any specific toxic or controversial compounds.
4. For each ingredient, assign a hazard level: Low, Medium, or High.
5. Provide an overall safety score from 0 to 100.
6. Provide a trust percentage (0–100) based on these criteria also give title as  Confidence in reading product data:
   - 90-100%: Crystal clear label, all ingredients visible, high confidence in accuracy
   - 70-89%: Good image quality, most ingredients visible, minor uncertainty
   - 50-69%: Moderate clarity, some ingredients unclear or partially visible
   - Below 50%: Poor image quality, difficult to read, significant uncertainty
7. Summarize the findings and give a recommendation.

Respond ONLY with valid JSON matching the provided schema.
Do not include explanations outside the JSON.
`;


  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please checks your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Query GenAI with both the model name and prompt/image parts.
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          overallSafetyScore: { type: Type.NUMBER },
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
        required: ["productName", "overallSafetyScore", "trustPercentage", "ingredients"]
      }
    }
  });

  // Directly access the .text property on the GenerateContentResponse object.
  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text.trim());
};

