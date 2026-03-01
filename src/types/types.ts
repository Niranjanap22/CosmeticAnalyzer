export interface IngredientInfo {
  name: string;
  purpose: string;
  hazardLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface RegulatoryStatus {
  isClean: boolean;
  issues: string[];
}

export interface AnalysisResult {
  productName: string;
  brand: string;
  overallSafetyScore: number;
  trustPercentage: number;
  ingredients: IngredientInfo[];
  toxicCompounds: string[];
  summary: string;
  recommendation: string;
  fdaCompliance: RegulatoryStatus;
  euCompliance: RegulatoryStatus;
  carcinogenStatus: RegulatoryStatus;
  allergenStatus: RegulatoryStatus;
  endocrineStatus: RegulatoryStatus;
}

export interface UserState {
  isLoggedIn: boolean;
  email: string | null;
}

export interface ScanHistoryItem {
  id?: string;
  userId: string;
  timestamp: number;
  productName: string;
  brand: string;
  overallSafetyScore: number;
  trustPercentage: number;
  summary: string;
  analysisData: AnalysisResult;
}
