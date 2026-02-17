
export interface IngredientInfo {
  name: string;
  purpose: string;
  hazardLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface AnalysisResult {
  productName: string;
  brand: string;
  overallSafetyScore: number; // 0-100
  trustPercentage: number; // 0-100
  ingredients: IngredientInfo[];
  toxicCompounds: string[];
  summary: string;
  recommendation: string;
}

export interface UserState {
  isLoggedIn: boolean;
  email: string | null;
}
