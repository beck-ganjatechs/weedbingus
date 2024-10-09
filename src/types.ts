export interface Strain {
  id: string;
  name: string;
  batchDate: string;
  totalGrams: number;
  remainingGrams: number;
  bestByDate: string;
  images: string[];
  videos: string[];
  labResults: LabResults;
}

export interface LabResults {
  thc: number;
  cbd: number;
  terpenes: { [key: string]: number };
}

export interface AppState {
  strains: Strain[];
  isAuthenticated: boolean;
}