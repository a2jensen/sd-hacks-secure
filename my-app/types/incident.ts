import { Timestamp } from "firebase/firestore";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  labels: string[];
  summary: string;
}

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  riskAssessment: RiskAssessment;
  createdAt: Timestamp;
}
