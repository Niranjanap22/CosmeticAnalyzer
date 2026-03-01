# Plan: User Scan History with Firestore

## 1. Objective
Allow logged-in users to view a history of cosmetic products they have previously analyzed. This involves saving analysis results to Firestore and retrieving them in a new UI section.

## 2. Data Storage Strategy (Firestore)

We need to store the `AnalysisResult` linked to a specific `userId`.

### Option A: Sub-collection (Recommended)
Store history inside the user document. This automatically organizes data by user and simplifies security rules.

*   **Path:** `users/{userId}/scanHistory/{scanId}`

### Data Model
Since Firestore documents have a 1MB limit, we should avoid storing large Base64 images directly if possible. We will store the full analysis text data.

```typescript
interface ScanHistoryItem {
  id?: string;              // Firestore Document ID
  userId: string;
  timestamp: number;        // Date.now()
  productName: string;
  brand: string;
  overallSafetyScore: number;
  trustPercentage: number;
  summary: string;
  
  // We store the full analysis so we can reconstruct the report view
  analysisData: AnalysisResult; 
  
  // Optional: Thumbnail URL if we decide to implement Firebase Storage later
  // For now, we might skip the image or store a very small low-res base64 if critical.
}
```

## 3. Implementation Steps

### Step 1: Create `HistoryService`
Create `src/services/historyService.ts` to handle Firestore interactions.

*   `saveScan(userId: string, result: AnalysisResult)`: Adds a document to `users/{userId}/scanHistory`.
*   `getUserHistory(userId: string)`: Fetches documents ordered by `timestamp` desc.

### Step 2: Update `Dashboard.tsx` (Saving)
Decide on **Auto-save** vs **Manual Save**.
*   **Recommendation:** **Auto-save** immediately after a successful analysis if the user is logged in.
*   **Logic:** Inside `startAnalysis`, after `analyzeCosmeticImage` returns successfully, call `historyService.saveScan`.

### Step 3: Create `HistoryView` Component
A new component to list previous scans.

*   **Location:** `src/components/HistoryView.tsx`
*   **UI:** A list of cards showing:
    *   Product Name & Brand
    *   Date scanned
    *   Safety Score (color-coded badge)
    *   "View Report" button.

### Step 4: Routing / Navigation
*   Add a "History" tab or button in the `App.tsx` navbar.
*   When clicked, switch the main view from `Dashboard` to `HistoryView`.
*   When a history item is clicked, show `AnalysisResultView` with the saved data.

## 4. Firestore Security Rules
Ensure users can only read/write their own history.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/scanHistory/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Future Considerations
*   **Image Storage:** Currently, we lose the image when reloading from history (unless we store base64, which is heavy). Future improvement: Upload image to Firebase Storage and save the `downloadURL` in the history document.
*   **Delete:** Allow users to delete specific history items.

## 6. Action Items
1.  [ ] Create `src/services/historyService.ts`.
2.  [ ] Integrate `saveScan` into `Dashboard.tsx`.
3.  [ ] Build `HistoryView.tsx` UI.
4.  [ ] Add navigation in `App.tsx`.