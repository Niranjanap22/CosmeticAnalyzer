# Gemini Service & Vision Pipeline Explained

**Current Architecture:** Hybrid Vision + Client-Side Deterministic Scoring.

This document details how the Cosmetic Analyzer processes images to provide safety ratings. We utilize Google's **Gemini 3 Flash Preview** for visual understanding and **TypeScript** for deterministic scoring.

## 1. The Pipeline

### Step 1: Image Pre-processing (Client-Side)
Before sending an image to the AI, we process it in the browser using `src/utils/imageUtils.ts`.

**Why?**
*   **Latency:** Smaller images upload faster.
*   **Cost:** Generative AI models often charge by token or image size. Optimizing reduces payload.
*   **API Limits:** Ensuring the image fits within standard dimensions (max 1024px) avoids rejection.

**How it works:**
We use the HTML5 Canvas API to resize the image while maintaining aspect ratio, converting it to a compressed JPEG (80% quality).

```typescript
// src/utils/imageUtils.ts
export const processImage = (file: File): Promise<string> => {
  // ... uses FileReader and Canvas to resize to max 1024px
};
```

### Step 2: Vision Analysis (Gemini AI)
We send the processed Base64 image to `gemini-3-flash-preview`.

**Why not OCR (Tesseract.js)?**
We initially attempted client-side OCR. However, cosmetic bottles are often cylindrical, reflective, or have stylized fonts. Standard OCR struggled significantly with these curved surfaces. Gemini's multimodal vision capabilities allow it to "read" text in context, handling curvature and lighting much better.

**The Prompt:**
We strictly instruct the AI *not* to calculate scores. Its job is purely **extraction and classification**.

```typescript
// src/services/geminiService.ts
const prompt = `
Analyze this cosmetic product image...
1. Identify product name/brand.
2. Extract ingredients.
3. Assign hazard level (Low, Medium, High) based on general knowledge.
...
Respond ONLY with valid JSON...
`;
```

### Step 3: Deterministic Scoring (TypeScript)
Once the AI returns the JSON with ingredients and hazard levels, we calculate the `overallSafetyScore` locally.

**Why?**
*   **Consistency:** LLMs are probabilistic. Asking them to do math (e.g., `(12 * 1 + 5 * 3) / ...`) often yields slightly different results for the same inputs. Code is 100% deterministic.
*   **Transparency:** The formula is hardcoded and verifiable.

**The Formula:**
```typescript
// src/services/geminiService.ts
let L = 0, M = 0, H = 0;
// Count ingredients based on AI classification
ingredients.forEach(ing => {
  if (ing.hazardLevel === "Low") L++;
  if (ing.hazardLevel === "Medium") M++;
  if (ing.hazardLevel === "High") H++;
});

const total = L + M + H;
const totalRisk = (1 * L) + (3 * M) + (5 * H);
const maxRisk = 5 * total;
const safetyScore = (1 - (totalRisk / maxRisk)) * 100;
```

## 2. Configuration

To further reduce variance in the AI's classification tasks, we set the model temperature to 0.

```typescript
generationConfig: {
  temperature: 0, // Force deterministic output
}
```