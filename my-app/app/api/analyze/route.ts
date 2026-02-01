import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RiskAssessment } from "@/types/incident";

// POST /api/analyze
// Accepts a multipart/form-data with `file` field and returns a mapped RiskAssessment JSON.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    // Convert file to Blob and append to form data we will send to EyePop
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || "image/jpeg" });

    // Prefer using official SDK if available (developer can add @eyepop.ai/eyepop package)
    // Try the more modern endpoint().connect() flow and a few common call shapes.
    let lastSdkErr = "";
    try {
      // Dynamically import SDK in case it's installed. Use a loose `any` check
      // because SDK method names/shape may vary between versions.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sdk: any = await import("@eyepop.ai/eyepop");
      if (sdk) {
        const key = process.env.EYEPOP_API_KEY ?? process.env.EYEPOP_SECRET_KEY;
        // If the SDK exposes endpoint().connect(), use it (recommended by EyePop docs)
        if (typeof sdk.endpoint === "function") {
          try {
            const endpoint = await sdk.endpoint().connect({ apiKey: key });

            // Try a number of common endpoint call shapes, preferring pop-id aware signatures
            const attempts: Array<() => Promise<any>> = [];

            if (process.env.EYEPOP_POP_ID) {
              const pop = process.env.EYEPOP_POP_ID;
              attempts.push(async () => (typeof endpoint.run === "function" ? await endpoint.run(pop, blob) : undefined));
              attempts.push(async () => (typeof endpoint.run === "function" ? await endpoint.run({ popId: pop, file: blob }) : undefined));
              attempts.push(async () => (typeof endpoint.analyze === "function" ? await endpoint.analyze(blob, { popId: pop }) : undefined));
              attempts.push(async () => (typeof endpoint.execute === "function" ? await endpoint.execute({ popId: pop, file: blob }) : undefined));
            }

            // General fallbacks
            attempts.push(async () => (typeof endpoint.analyze === "function" ? await endpoint.analyze(blob) : undefined));
            attempts.push(async () => (typeof endpoint.run === "function" ? await endpoint.run(blob) : undefined));

            for (const fn of attempts) {
              try {
                const resp = await fn();
                if (resp) {
                  const mapped = mapToRiskAssessment(resp);
                  return NextResponse.json(mapped);
                }
              } catch (e: any) {
                lastSdkErr = e?.message || String(e);
                // try next attempt
              }
            }
          } catch (e: any) {
            lastSdkErr = e?.message || String(e);
          }
        }

        // If SDK exposes simple analyze functions, try those too
        const simpleAnalyze = sdk.analyze || sdk.default?.analyze;
        if (typeof simpleAnalyze === "function") {
          try {
            const resp = await simpleAnalyze(blob, { apiKey: process.env.EYEPOP_API_KEY ?? process.env.EYEPOP_SECRET_KEY, popId: process.env.EYEPOP_POP_ID });
            const mapped = mapToRiskAssessment(resp);
            return NextResponse.json(mapped);
          } catch (e: any) {
            lastSdkErr = e?.message || String(e);
          }
        }
      }
    } catch (err: any) {
      lastSdkErr = err?.message || String(err);
      // SDK not available or failed, fall through to HTTP fetch below
    }

    if (lastSdkErr) {
      // Include in logs for easier debugging locally
      console.warn("EyePop SDK attempts failed:", lastSdkErr);
    }

    // Ensure API key is provided. Accept either EYEPOP_API_KEY or EYEPOP_SECRET_KEY for compatibility with existing env.
    const EYEPOP_API_KEY = process.env.EYEPOP_API_KEY ?? process.env.EYEPOP_SECRET_KEY;
    if (!EYEPOP_API_KEY) {
      // If no API key, return a helpful stub so dev flow continues.
      const stub: RiskAssessment = {
        level: "medium",
        score: 45,
        labels: ["person", "vehicle"],
        summary: "EyePop API key not configured; returned stubbed analysis.",
      };
      return NextResponse.json(stub);
    }

    // Fallback: call EyePop REST endpoint(s).
    // Try the canonical analyze endpoint first, then try a pop-specific path if provided.
    const fd = new FormData();
    fd.append("file", blob, "photo.jpg");

    const endpoints = ["https://api.eyepop.ai/v1/analyze"];
    if (process.env.EYEPOP_POP_ID) {
      endpoints.push(
        `https://api.eyepop.ai/v1/pops/${process.env.EYEPOP_POP_ID}/analyze`
      );
      // Some deployments expose a different run path; include a conservative additional guess
      endpoints.push(
        `https://api.eyepop.ai/v1/pops/${process.env.EYEPOP_POP_ID}/run`
      );
    }

    let lastErrText = "";
    let resp: Response | null = null;

    for (const url of endpoints) {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EYEPOP_API_KEY}`,
        },
        body: fd,
      }).catch((e) => {
        lastErrText = e?.message || String(e);
        return null as any;
      });

      if (!resp) continue;

      if (resp.ok) {
        const eyepopJson = await resp.json();
        const mapped = mapToRiskAssessment(eyepopJson);
        return NextResponse.json(mapped);
      }

      // capture body for diagnostics
      lastErrText = await resp.text().catch(() => "");

      // if 404 try the next endpoint; for other errors stop and return diagnostics
      if (resp.status === 404) {
        continue; // try next endpoint
      }

      return new NextResponse(`EyePop error: ${resp.status} ${lastErrText} (url: ${url})`, { status: 502 });
    }

    // If we get here no endpoint returned 200
    return new NextResponse(
      `EyePop error: no successful endpoint (last: ${lastErrText}). Tried: ${endpoints.join(", ")}`,
      { status: 502 }
    );
  } catch (err: any) {
    return new NextResponse(err?.message || "Internal Server Error", { status: 500 });
  }
}

function mapToRiskAssessment(body: any): RiskAssessment {
  // Recommended mapping — adapt if your EyePop response has different fields.
  // - `tags` or `labels` => labels array
  // - `score` or `confidence` => numeric score 0-100
  // - `summary` => human-readable summary
  const labels: string[] = Array.isArray(body.tags)
    ? body.tags
    : Array.isArray(body.labels)
    ? body.labels
    : (body.labels || body.tags || []).map((l: any) => String(l));

  let score = 0;
  if (typeof body.score === "number") score = body.score;
  else if (typeof body.confidence === "number") score = Math.round(body.confidence * 100);

  // Map numeric score/confidence to risk level
  const level = score >= 85 ? "critical" : score >= 65 ? "high" : score >= 35 ? "medium" : "low";

  const summary =
    body.summary ||
    (labels.length > 0 ? `Detected tags: ${labels.join(", ")}` : "No notable tags detected.");

  return {
    level: level as any,
    score,
    labels,
    summary,
  };
}
