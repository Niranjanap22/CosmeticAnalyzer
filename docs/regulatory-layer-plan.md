# Plan: FDA & EU Regulatory Comparison Layer

## 1. Objective
Add a deterministic "Manual Comparison Layer" to the analysis pipeline. After the AI extracts ingredients, we will programmatically check them against known FDA and EU regulatory lists to determine compliance status.

## 2. Data Storage Strategy
**Recommendation:** In-Memory / Local TypeScript File.

Since this is a college project and regulatory lists (Banned/Restricted substances) are relatively static, storing them in a structured TypeScript file is superior to a database because:
*   **Zero Latency:** No network calls needed to check ingredients.
*   **Type Safety:** We can use TypeScript interfaces to ensure data integrity.
*   **Simplicity:** No need to manage Firestore reads/writes or seeding scripts.

### Proposed Data Structure (`src/data/regulatoryData.ts`)
We will convert the `cosmetic_safety_reference.md` into constant Sets and Maps for O(1) lookup speed.

```typescript
// Example Structure
export const FDA_BANNED = new Set([
  "bithionol",
  "chloroform",
  "methylene chloride",
  // ...
]);

export const EU_BANNED = new Set([
  "mercury",
  "lead",
  "cadmium",
  "lilial",
  // ...
]);

export const EU_RESTRICTED = new Map<string, string>([
  ["formaldehyde", "Max 0.2%"],
  ["triclosan", "Allowed only in specific products"],
  // ...
]);
```

## 3. Implementation Steps

### Step 1: Create the Data File
*   Create `src/data/regulatoryData.ts`.
*   Populate it with the data from `docs/cosmetic_safety_reference.md`.
*   Normalize all keys to lowercase for case-insensitive matching.

### Step 2: Update Types
Update `src/types/types.ts` to include the new compliance data in the result.

```typescript
export interface RegulatoryStatus {
  isClean: boolean;
  issues: string[]; // e.g., "Banned in EU: Lilial", "Restricted in FDA: Sunscreen active"
}

export interface AnalysisResult {
  // ... existing fields
  fdaCompliance: RegulatoryStatus;
  euCompliance: RegulatoryStatus;
}
```

### Step 3: Implement the Comparison Logic
Create a utility function `checkCompliance(ingredients: string[])` in a new service file (e.g., `src/services/regulatoryService.ts`).

*   **Logic:**
    1.  Iterate through the extracted ingredient list.
    2.  Normalize ingredient name (lowercase, trim).
    3.  Check if it exists in `FDA_BANNED`.
    4.  Check if it exists in `EU_BANNED` or `EU_RESTRICTED`.
    5.  Return the `RegulatoryStatus` objects.

### Step 4: Integrate into Analysis Pipeline
Modify `src/services/geminiService.ts` (or the new `analyzeProductImage` pipeline):

1.  **AI/OCR Step:** Get the list of ingredients.
2.  **Regulatory Step:** Call `checkCompliance(ingredients)`.
3.  **Merge:** Add the compliance results to the final JSON object returned to the frontend.

### Step 5: Update UI (`AnalysisResult.tsx`)
Add a new section below the "Overall Verdict" or "Toxic Compounds" section.

*   **Visuals:**
    *   Two cards: "FDA Status" and "EU Status".
    *   **Green Check:** If `isClean` is true.
    *   **Red Warning:** If `issues` array has items, list them.
    *   (Future) Add an "Info" icon that opens a modal showing the full banned lists.

## 4. Example UI Layout

```text
+--------------------------------------------------+
|  [ FDA Compliance ]          [ EU Compliance ]   |
|  ✅ Approved for use         ❌ Issues Found     |
|                              • Banned: Lilial    |
|                              • Restricted: Talc  |
+--------------------------------------------------+
```

## 5. Future Enhancements
*   **Full List Modal:** As requested, an icon to view the entire database of banned substances.
*   **Fuzzy Matching:** Use a library like `fuse.js` if exact string matching fails (e.g., "Red 40" vs "FD&C Red No. 40").

## 6. Action Plan
1.  [ ] Create `src/data/regulatoryData.ts`.
2.  [ ] Update `AnalysisResult` interface.
3.  [ ] Implement `checkCompliance` function.
4.  [ ] Integrate into `geminiService.ts`.
5.  [ ] Update `AnalysisResult.tsx` to render the new data.
```

<!--
[PROMPT_SUGGESTION]Go ahead and create the src/data/regulatoryData.ts file with the data from the reference markdown.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Update the types and the Gemini service to include this new regulatory check layer.[/PROMPT_SUGGESTION]
