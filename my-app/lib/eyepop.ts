import type { RiskAssessment } from "@/types/incident";

// TODO: Replace with real EyePop.ai API call once dashboard credentials are available.
// For now this returns a stubbed response so the rest of the flow works end-to-end.
export async function analyzePhoto(_file: File): Promise<RiskAssessment> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1000));

  return {
    level: "medium",
    score: 45,
    labels: ["person", "vehicle"],
    summary: "Stubbed analysis — replace with EyePop.ai integration.",
  };
}
