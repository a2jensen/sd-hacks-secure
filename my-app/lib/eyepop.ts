import type { RiskAssessment } from "@/types/incident";

// Client-side wrapper: uploads the file to our serverless API which calls EyePop.ai
export async function analyzePhoto(file: File): Promise<RiskAssessment> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Photo analysis failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as RiskAssessment;
  return data;
}
