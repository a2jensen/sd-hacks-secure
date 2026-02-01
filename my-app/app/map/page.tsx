"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { subscribeToIncidents } from "@/lib/firestore";
import { ReportButton } from "@/components/report-button";
import type { Incident } from "@/types/incident";

const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    return subscribeToIncidents(setIncidents);
  }, []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <MapView incidents={incidents} />
      <ReportButton />
    </div>
  );
}
