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

export interface ScorePenalty {
  count: number;
  weight: number;
  total: number;
}

export interface ScoreBreakdown {
  ingredientCounts: {
    low: number;
    medium: number;
    high: number;
    total: number;
  };
  baseScore: number;
  penalties: {
    fda: ScorePenalty;
    eu: ScorePenalty;
    carcinogen: ScorePenalty;
    endocrine: ScorePenalty;
    allergen: ScorePenalty;
  };
  totalPenalty: number;
  rawScore: number;
  clampedScore: number;
  finalScore: number;
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
  scoreBreakdown?: ScoreBreakdown;
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
