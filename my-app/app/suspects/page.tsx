"use client";

import { useEffect, useState } from "react";
import { subscribeToSuspects } from "@/lib/firestore";
import { SuspectCard } from "@/components/suspect-card";
import type { Incident } from "@/types/incident";

const RISK_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<Incident[]>([]);

  useEffect(() => {
    return subscribeToSuspects(setSuspects);
  }, []);

  const sorted = [...suspects].sort(
    (a, b) =>
      (RISK_ORDER[a.riskAssessment.level] ?? 4) -
      (RISK_ORDER[b.riskAssessment.level] ?? 4)
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ucsd-gradient">Suspects</h1>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ucsd-gold">
        EyePop.ai&apos;s Watchlist
      </p>
      <p className="mb-6 text-sm text-zinc-500">
        Ranked by threat level — most critical first.
      </p>
      {suspects.length === 0 ? (
        <p className="text-center text-zinc-500">
          No suspects reported yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((incident) => (
            <SuspectCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
