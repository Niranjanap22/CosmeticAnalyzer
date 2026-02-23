### Making CosmoBot More Deterministic

This document explains **why the AI gives different answers for the same product**, and proposes a more deterministic design that:

- Uses **non‑AI OCR** (text recognition) to extract ingredients when possible.
- Uses **Gemini only where needed** (classification/interpretation, not math or OCR).
- Makes **safety scoring 100% deterministic** in TypeScript.
- Optionally tunes **model randomness** (temperature, top‑K) to further stabilize outputs.

The goal is to **reduce randomness and surprises**, while still using AI where it adds clear value.

---

### 1. Why results change between runs

Right now, your pipeline is:

- File: `src/services/geminiService.ts`

```1:5:C:\Users\91808\Desktop\CosmeticAnalyzer\src\services\geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "@/types/types";

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
```

The **prompt** asks Gemini to:

1. Read the image.
2. Extract ingredients.
3. Assign hazard levels.
4. Compute the safety score.
5. Compute trust percentage.
6. Return a JSON object.

Gemini is a **probabilistic model**:

- Even with the same image and prompt, it samples tokens from a probability distribution.
- The sampling process is controlled by parameters like **temperature**, **top‑K**, and **top‑P**.
- There can also be **model updates over time** (Gemini’s weights change), which can change outputs even with the same parameters.

So today, we are asking Gemini to do **three jobs at once**:

1. OCR (reading text from an image)  
2. Semantic interpretation (understanding ingredients and hazard levels)  
3. Arithmetic (score calculation)  

All of that happens **inside one black‑box call**, so you can’t easily pin down where differences come from.

---

### 2. Design goals for a more stable system

We’ll aim for:

- **Deterministic safety score**  
  \- All math lives in your TypeScript code, not in Gemini.  

- **Less AI, but better targeted**  
  \- Use AI for “fuzzy” tasks (understanding ingredients, mapping to hazards), not for things that can be exact (OCR, arithmetic).

- **Separatable stages**  
  \- Split the pipeline into:  
    1. Image → Text (OCR)  
    2. Text → Structured ingredients  
    3. Structured ingredients → Score  
  
- **Configurable randomness**  
  \- When we *do* call Gemini, use parameters to reduce randomness (temperature, top‑K, etc.).

---

### 3. Stage 1 – Extract ingredients without AI (OCR first)

**Goal**: Turn the uploaded image into a reliable text representation of the ingredient list, **without** using an LLM.

#### 3.1. Option A – Browser OCR with Tesseract.js (client‑side)

- Library: [`tesseract.js`](https://tesseract.projectnaptha.com/)
- Runs OCR **directly in the browser** (no backend needed).
- Works from:
  - image URLs
  - `<img>` elements
  - base64 image data.

**High‑level TypeScript shape (conceptual):**

```ts
// src/services/ocrService.ts
import { createWorker } from 'tesseract.js';

export async function extractIngredientsWithOcr(base64Image: string): Promise<string> {
  const worker = await createWorker('eng'); // English
  const { data } = await worker.recognize(base64Image);
  await worker.terminate();
  return data.text; // raw OCR text from the image
}
```

Then we’d post‑process:

```ts
export function parseIngredientsFromText(rawText: string): string[] {
  // 1. Find the line that starts with "Ingredients" (or variants).
  // 2. Take text after ":".
  // 3. Split by commas.
  // 4. Trim whitespace and normalize casing.
  // 5. Filter out empty entries.
  return [];
}
```

**Pros**

- No extra AI calls for OCR.
- Deterministic for the same image and OCR version.
- Runs fully locally in the user’s browser.

**Cons**

- Adds another relatively heavy dependency (Tesseract is not tiny).
- Performance may be slower on low‑end devices.
- Accuracy can still be imperfect for low‑quality photos.

#### 3.2. Option B – Server‑side OCR (future)

Instead of running OCR in the browser, you could:

- Send the image to your own backend (e.g. a Node server or Cloud Function).
- Use:
  - Tesseract on the server, or
  - a managed OCR API like Google Cloud Vision.

This moves:

- **Secrets** (API keys) to the backend.
- Heavy CPU work off the user’s device.

For now, the repo is frontend‑only, so this is a **future architecture** option.

#### 3.3. Fallback to AI if OCR fails

Sometimes OCR will:

- Not find a clear “Ingredients” label.
- Return very short or obviously broken text.

In that case, we can **fallback to the current Gemini image analysis** path:

```ts
if (ingredientsFromOcrAreGoodEnough) {
  // Use OCR → text pipeline
} else {
  // Fallback: call Gemini with the image like we do today
}
```

“Good enough” can be a simple heuristic:

- At least N characters of text.
- At least, say, 3–5 comma‑separated entries that look like ingredients.

---

### 4. Stage 2 – Use Gemini only for classification, not math

Once we have a **clean list of ingredient strings** (from OCR or Gemini fallback), we can:

1. Ask Gemini to classify ingredients into hazard levels + descriptions.
2. Compute the safety score **locally** in TypeScript using a deterministic formula.

#### 4.1. New text‑only Gemini service

Instead of sending the **image**, we send just the ingredients:

```ts
export interface IngredientClassification {
  name: string;
  hazardLevel: 'Low' | 'Medium' | 'High' | 'Unknown';
  description: string;
  purpose: string;
}

export interface ClassificationResponse {
  ingredients: IngredientClassification[];
  toxicCompounds: string[];
  summary: string;
  recommendation: string;
}
```

**Conceptual Gemini call (TypeScript):**

```ts
import { GoogleGenAI, Type } from '@google/genai';

export async function classifyIngredientsWithGemini(
  ingredients: string[]
): Promise<ClassificationResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `
You are a cosmetic ingredient safety expert.
Given a list of ingredient names, classify each into a hazard level and explain briefly.

Important:
- Do NOT invent ingredients that are not in the list.
- If you don't recognize an ingredient, mark it as "Unknown".
- Do NOT calculate any scores. Just classify and describe.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { text: prompt },
      { text: 'Ingredients:\n' + ingredients.join(', ') },
    ],
    generationConfig: {
      temperature: 0,       // more deterministic
      topK: 1,              // choose the highest-probability token
      candidateCount: 1,    // single answer
    },
    responseSchema: {
      // similar to your current schema but focused on classification only
    },
    responseMimeType: 'application/json',
  });

  const text = response.text;
  if (!text) throw new Error('No response from Gemini');
  return JSON.parse(text.trim());
}
```

> Note: In your current code, you pass `config: { responseMimeType, responseSchema }`.  
> The exact field names for `generationConfig` can vary slightly between SDK versions; the idea stays the same: **you can set `temperature`, `topK`, etc.** to reduce randomness.

#### 4.2. Deterministic safety scoring in TypeScript

From `ClassificationResponse`, we can compute the safety score as you described in the prompt, but locally and deterministically:

```ts
function computeSafetyScore(classified: ClassificationResponse): number {
  let L = 0, M = 0, H = 0;

  for (const ing of classified.ingredients) {
    if (ing.hazardLevel === 'Low') L++;
    else if (ing.hazardLevel === 'Medium') M++;
    else if (ing.hazardLevel === 'High') H++;
  }

  const total = L + M + H;
  if (total === 0) return 0;

  const totalRisk = (1 * L) + (3 * M) + (5 * H);
  const maxRisk = 5 * total;

  const score = (1 - totalRisk / maxRisk) * 100;
  return Math.round(score * 100) / 100; // round to 2 decimals
}
```

This function will **always** return the same value for the same classification result.

If Gemini classifies ingredients the same way, the score is identical, regardless of model randomness elsewhere.

---

### 5. Stage 3 – Tuning Gemini randomness (temperature, top‑K, etc.)

Even after we move math out, you may want ingredient classifications themselves to be more stable.

Common parameters:

- **temperature** (0.0–2.0)
  - Lower = more deterministic, higher = more creative.
  - `0` or `0.1` is good when you want consistency.

- **top‑K**
  - Limits sampling to the K most probable tokens.
  - `1` basically means “always pick the most likely token” (greedy decoding).

- **top‑P**
  - Nucleus sampling (use tokens until cumulative probability > P).
  - If you lower it, you reduce randomness.
  - Often you tune **either** temperature **or** top‑P, not both.

For your use case (safety classification, not creative writing), a safe starting config is:

```ts
generationConfig: {
  temperature: 0,
  topK: 1,
  candidateCount: 1,
}
```

This won’t make things **mathematically** fully deterministic (there’s still some underlying model behavior), but in practice it will drastically reduce variation.

---

### 6. End‑to‑end pipeline (new design)

Putting it all together:

1. **User uploads an image** (as today) in `Dashboard.tsx`.
2. `Dashboard.tsx` calls a new high‑level service, e.g.:
   - `analyzeProductImage(base64Image: string): Promise<AnalysisResult>`
3. Inside that function:
   1. Run **OCR pipeline**:
      - `rawText = extractIngredientsWithOcr(base64Image)`
      - `ingredients = parseIngredientsFromText(rawText)`
   2. If ingredients look “good enough”:
      - Call `classifyIngredientsWithGemini(ingredients)`
   3. Else:
      - Fallback to current `analyzeCosmeticImage` image‑based Gemini call (maybe with lower randomness).
   4. Compute safety score with `computeSafetyScore` in TypeScript.
   5. Construct a final `AnalysisResult` (same shape as today) and return it.

4. `Dashboard.tsx` renders the `AnalysisResult` with `AnalysisResultView` as it does now.

---

### 7. Implementation plan for this repo

**Phase 1 – Make math deterministic (no OCR yet)**

1. **Change the Gemini prompt** to:
   - Stop asking the model to calculate scores.
   - Only ask for classification + toxic compounds + summary/recommendation.
2. **Add a local `computeSafetyScore` function** (as above) in a new utility or service file.
3. **Update `geminiService.ts`** to:
   - Call Gemini for classification.
   - Compute the score locally.
   - Return a full `AnalysisResult` with the computed score.
4. **Optionally add `generationConfig`** with `temperature: 0`, `topK: 1`.

This phase already improves determinism a lot, with minimal changes.

**Phase 2 – Introduce OCR + two‑stage analysis**

1. Install `tesseract.js` and create `src/services/ocrService.ts`.
2. Implement:
   - `extractIngredientsWithOcr(base64Image: string)`
   - `parseIngredientsFromText(rawText: string): string[]`
3. Add a new high‑level service (e.g. `src/services/analyzeProductImage.ts`) that:
   - Tries OCR first.
   - Falls back to direct Gemini image analysis when OCR is not good enough.
4. Update `Dashboard.tsx` to call this new high‑level service instead of calling Gemini directly.

**Phase 3 – (Optional) Backend & security**

1. Move:
   - OCR,
   - Gemini calls,
   - safety scoring
   to a backend (e.g. Cloud Functions).
2. The frontend:
   - Only uploads the image / ingredients.
   - Receives an `AnalysisResult` from your API.
3. This:
   - Hides your API key from the browser.
   - Allows caching and versioning of the analysis logic.

---

### 8. Key takeaways

- **Use AI where it’s needed, not everywhere**:
  - OCR and arithmetic can be done deterministically by traditional code.
  - Use Gemini mainly for “understanding” ingredients and mapping them to hazards.

- **Split responsibilities**:
  - Stage 1: Image → Text (OCR).
  - Stage 2: Text → Structured ingredients via AI.
  - Stage 3: Structured data → Score via TypeScript.

- **Control randomness**:
  - When calling Gemini, use low `temperature` and `topK = 1` for stability.

With this design, you keep the **intelligence** of Gemini while gaining **predictability** and a much clearer mental model of where differences can still come from.

