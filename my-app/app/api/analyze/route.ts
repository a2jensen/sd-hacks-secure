export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import EyePop from "@eyepop.ai/eyepop";
import type { PredictedObject } from "@eyepop.ai/eyepop";
import type { RiskAssessment, RiskLevel } from "@/types/incident";

// Threat keywords that increase risk score
const THREAT_KEYWORDS: Record<string, number> = {
  knife: 30,
  gun: 40,
  weapon: 40,
  fire: 35,
  smoke: 25,
  blood: 30,
  fight: 25,
  crash: 20,
  explosion: 40,
  broken: 15,
  damaged: 15,
  hazard: 20,
  suspicious: 15,
};

// POST /api/analyze
// Accepts multipart/form-data with a `file` field, sends it to EyePop for
// object detection, and returns a mapped RiskAssessment.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      console.log("[analyze] No file in request");
      return new NextResponse("Missing file", { status: 400 });
    }

    console.log(`[analyze] Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    const secretKey = process.env.EYEPOP_SECRET_KEY;
    const popId = process.env.EYEPOP_POP_ID;

    if (!secretKey) {
      console.warn("[analyze] EYEPOP_SECRET_KEY not set, returning stub");
      // Return stub so dev flow continues without a key
      const stub: RiskAssessment = {
        level: "medium",
        score: 45,
        labels: ["person", "vehicle"],
        summary: "EyePop API key not configured; returned stubbed analysis.",
      };
      return NextResponse.json(stub);
    }

    // Connect to EyePop using the SDK
    console.log(`[analyze] Connecting to EyePop (popId: ${popId})`);
    const endpoint = EyePop.workerEndpoint({
      auth: { apiKey: secretKey },
      popId: popId || undefined,
    });

    await endpoint.connect();
    console.log("[analyze] Connected to EyePop");

    try {
      // Convert the uploaded file to a Blob the SDK can process
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || "image/jpeg" });

      // Process the image — pass as a StreamSource
      console.log("[analyze] Sending image to EyePop for processing...");
      const resultStream = await endpoint.process({
        stream: blob,
        mimeType: file.type || "image/jpeg",
      });

      // Collect all predictions from the async iterable
      const allObjects: PredictedObject[] = [];
      for await (const prediction of resultStream) {
        console.log("[analyze] Prediction received:", JSON.stringify(prediction, null, 2));
        if (prediction.objects) {
          allObjects.push(...prediction.objects);
        }
      }

      console.log(`[analyze] Total objects detected: ${allObjects.length}`);
      allObjects.forEach((obj, i) => {
        console.log(`[analyze]   [${i}] ${obj.classLabel} (confidence: ${obj.confidence.toFixed(3)}, x: ${obj.x}, y: ${obj.y}, w: ${obj.width}, h: ${obj.height})`);
      });

      // Map detected objects to a RiskAssessment
      const assessment = mapToRiskAssessment(allObjects);
      console.log("[analyze] Final assessment:", JSON.stringify(assessment));
      return NextResponse.json(assessment);
    } finally {
      console.log("[analyze] Disconnecting from EyePop");
      await endpoint.disconnect().catch(() => {});
    }
  } catch (err: any) {
    console.error("[analyze] EyePop analysis error:", err);
    return new NextResponse(err?.message || "Internal Server Error", {
      status: 500,
    });
  }
}

function mapToRiskAssessment(objects: PredictedObject[]): RiskAssessment {
  // Extract unique class labels
  const labels = [...new Set(objects.map((o) => o.classLabel))];

  // Calculate risk score based on detected objects
  let score = 0;

  // Base score from number of objects detected
  score += Math.min(objects.length * 5, 20);

  // Check each detected label against threat keywords
  for (const obj of objects) {
    const label = obj.classLabel.toLowerCase();
    for (const [keyword, weight] of Object.entries(THREAT_KEYWORDS)) {
      if (label.includes(keyword)) {
        score += weight * obj.confidence;
      }
    }
    // High-confidence detections of any object add a small amount
    if (obj.confidence > 0.8) {
      score += 2;
    }
  }

  // Clamp to 0–100
  score = Math.min(Math.round(score), 100);

  // Map score to risk level
  let level: RiskLevel;
  if (score >= 85) level = "critical";
  else if (score >= 65) level = "high";
  else if (score >= 35) level = "medium";
  else level = "low";

  // Build summary
  let summary: string;
  if (labels.length === 0) {
    summary = "No objects detected in the image.";
  } else {
    summary = `Detected: ${labels.join(", ")}. Risk score: ${score}/100.`;
  }

  return { level, score, labels, summary };
}
