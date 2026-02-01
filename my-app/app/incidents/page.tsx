"use client";

import { useEffect, useState } from "react";
import { subscribeToIncidents } from "@/lib/firestore";
import { IncidentCard } from "@/components/incident-card";
import type { Incident } from "@/types/incident";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    return subscribeToIncidents(setIncidents);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-ucsd-navy">
        Recent Incidents
      </h1>
      {incidents.length === 0 ? (
        <p className="text-center text-zinc-500">No incidents reported yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
