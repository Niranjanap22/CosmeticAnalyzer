
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

// Always use process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  // Use gemini-3-flash-preview as it's a capable multimodal model for this task.
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this cosmetic product image. 
    1. Identify the product name and brand.
    2. Extract the full ingredient list if visible.
    3. Identify any specific toxic or controversial compounds (like parabens, sulfates, phthalates, formaldehyde, etc.).
    4. Provide an overall safety score from 0 to 100 (where 100 is perfectly safe).
    5. Provide a trust percentage (0-100) based on how clearly you can read the ingredients and identify the product.
    6. Categorize each ingredient's hazard level as Low, Medium, or High.
    7. Summarize the findings and give a recommendation.
  `;

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
