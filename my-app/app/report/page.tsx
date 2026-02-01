"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { PhotoUpload } from "@/components/photo-upload";
import { RiskBadge } from "@/components/risk-badge";
import { analyzePhoto } from "@/lib/eyepop";
import { uploadIncidentPhoto } from "@/lib/storage";
import { createIncident } from "@/lib/firestore";
import type { RiskAssessment } from "@/types/incident";

const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

type Step = "location" | "photo" | "analyzing" | "review";

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [description, setDescription] = useState("");
  const [suspectVisible, setSuspectVisible] = useState(false);
  const [suspectDescription, setSuspectDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAnalyze() {
    if (!file) return;
    setStep("analyzing");
    try {
      const result = await analyzePhoto(file);
      setAssessment(result);
      setStep("review");
    } catch (err: any) {
      console.error("Analyze failed", err);
      alert(err?.message || "Analysis failed — check server logs or API key.");
      setStep("photo");
    }
  }

  async function handleSubmit() {
    if (!location || !file || !assessment) return;
    setSubmitting(true);
    const photoUrl = await uploadIncidentPhoto(file);
    await createIncident({
      latitude: location.lat,
      longitude: location.lng,
      photoUrl,
      riskAssessment: assessment,
      description: description.trim() || undefined,
      suspectVisible: suspectVisible || undefined,
      suspectDescription: suspectVisible && suspectDescription.trim() ? suspectDescription.trim() : undefined,
    });
    router.push("/map");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ucsd-gradient">Report Incident</h1>

      {/* Progress */}
      <div className="mb-6 flex gap-2 text-sm font-semibold">
        {(["location", "photo", "review"] as const).map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 transition-all duration-200 ${
              step === s || (step === "analyzing" && s === "photo")
                ? "bg-ucsd-gradient text-white shadow-sm"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {/* Step 1: Location */}
      {step === "location" && (
        <div>
          <p className="mb-3 text-sm text-zinc-600">
            Click on the map to place the incident location.
          </p>
          <div className="h-80 overflow-hidden rounded-lg border">
            <MapView
              incidents={[]}
              onMapClick={(lat, lng) => setLocation({ lat, lng })}
            />
          </div>
          {location && (
            <p className="mt-2 text-sm text-zinc-500">
              Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
          <button
            disabled={!location}
            onClick={() => setStep("photo")}
            className="bg-ucsd-gradient-subtle mt-4 w-full rounded-xl py-3 font-semibold text-white shadow transition-all duration-200 hover:shadow-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Photo */}
      {step === "photo" && (
        <div>
          <PhotoUpload file={file} onFileChange={setFile} />
          <button
            disabled={!file}
            onClick={handleAnalyze}
            className="bg-ucsd-gradient-subtle mt-4 w-full rounded-xl py-3 font-semibold text-white shadow transition-all duration-200 hover:shadow-md disabled:opacity-40"
          >
            Analyze Photo
          </button>
        </div>
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ucsd-navy border-t-transparent" />
          <p className="text-zinc-600">Analyzing photo with EyePop.ai...</p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === "review" && assessment && (
        <div className="flex flex-col gap-4">
          {/* EyePop Analysis */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-ucsd-navy">EyePop Analysis</span>
              <RiskBadge level={assessment.level} />
            </div>
            <p className="text-sm text-zinc-600">{assessment.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {assessment.labels.map((label) => (
                <span
                  key={label}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Score: {assessment.score}/100
            </p>
          </div>

          {/* User Description */}
          <div className="rounded-lg border p-4">
            <label
              htmlFor="description"
              className="mb-2 block font-semibold text-ucsd-navy"
            >
              Your Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see or any additional details..."
              rows={4}
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-ucsd-navy focus:outline-none"
            />
          </div>

          {/* Suspect Flag */}
          <div className="rounded-lg border p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={suspectVisible}
                onChange={(e) => setSuspectVisible(e.target.checked)}
                className="h-4 w-4 accent-ucsd-navy"
              />
              <span className="font-semibold text-ucsd-navy">
                Suspect / individual visible in photo
              </span>
            </label>
            {suspectVisible && (
              <textarea
                value={suspectDescription}
                onChange={(e) => setSuspectDescription(e.target.value)}
                placeholder="Describe the suspect (clothing, appearance, distinguishing features...)"
                rows={3}
                className="mt-3 w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-ucsd-navy focus:outline-none"
              />
            )}
          </div>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="bg-ucsd-gradient-gold w-full rounded-xl py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      )}
    </div>
  );
}
