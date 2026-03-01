import { db } from "@/lib/firebase";
import { AnalysisResult, ScanHistoryItem } from "@/types/types";

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
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    } as ScanHistoryItem));
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};