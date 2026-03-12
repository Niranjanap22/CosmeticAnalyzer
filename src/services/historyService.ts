import { db } from "@/lib/firebase";
import { AnalysisResult, ScanHistoryItem } from "@/types/types";

const normalizeTimestampToMs = (value: any): number => {
  if (typeof value === "number") {
    // Handle both milliseconds and seconds just in case old records used seconds.
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  if (value && typeof value.toDate === "function") {
    // Firestore Timestamp object.
    return value.toDate().getTime();
  }

  if (value && typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return Date.now();
};

export const saveScan = async (userId: string, result: AnalysisResult) => {
  try {
    // Using Firebase Compat API (db.collection...)
    await db.collection("users").doc(userId).collection("scanHistory").add({
      userId,
      timestamp: Date.now(),
      productName: result.productName,
      brand: result.brand,
      overallSafetyScore: result.overallSafetyScore,
      trustPercentage: result.trustPercentage,
      summary: result.summary,
      analysisData: result
    });
    console.log("Scan saved to history");
  } catch (error) {
    console.error("Error saving scan history:", error);
  }
};

export const getUserHistory = async (userId: string): Promise<ScanHistoryItem[]> => {
  try {
    // Using Firebase Compat API
    const snapshot = await db.collection("users")
      .doc(userId)
      .collection("scanHistory")
      .orderBy("timestamp", "desc")
      .get();
    
    return snapshot.docs.map((doc) => {
      const raw = doc.data() as any;
      return {
        id: doc.id,
        ...raw,
        timestamp: normalizeTimestampToMs(raw.timestamp)
      } as ScanHistoryItem;
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};
