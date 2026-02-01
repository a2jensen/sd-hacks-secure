"use client";

import { useEffect, useState } from "react";
import { subscribeToSuspects } from "@/lib/firestore";
import { SuspectCard } from "@/components/suspect-card";
import type { Incident } from "@/types/incident";

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<Incident[]>([]);

  useEffect(() => {
    return subscribeToSuspects(setSuspects);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-ucsd-navy">Suspects</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Incidents where a suspect or individual was identified in the photo.
      </p>
      {suspects.length === 0 ? (
        <p className="text-center text-zinc-500">
          No suspects reported yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {suspects.map((incident) => (
            <SuspectCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
