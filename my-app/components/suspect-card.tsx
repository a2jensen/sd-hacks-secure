"use client";

import Image from "next/image";
import { RiskBadge } from "./risk-badge";
import type { Incident } from "@/types/incident";

export function SuspectCard({ incident }: { incident: Incident }) {
  const time = incident.createdAt?.toDate?.();
  const timeStr = time
    ? time.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div className="overflow-hidden rounded-lg border">
      {incident.photoUrl && (
        <div className="relative h-56 w-full">
          <Image
            src={incident.photoUrl}
            alt="Suspect photo"
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <RiskBadge level={incident.riskAssessment.level} />
          <span className="text-xs text-zinc-400">{timeStr}</span>
        </div>

        {/* Suspect Description */}
        {incident.suspectDescription && (
          <div>
            <p className="text-xs font-semibold text-red-600">Suspect Description</p>
            <p className="text-sm text-zinc-700">{incident.suspectDescription}</p>
          </div>
        )}

        {/* EyePop Analysis */}
        <div>
          <p className="text-xs font-semibold text-ucsd-navy">EyePop Analysis</p>
          <p className="text-sm text-zinc-600">{incident.riskAssessment.summary}</p>
        </div>

        {/* User Description */}
        {incident.description && (
          <p className="text-sm text-zinc-600">{incident.description}</p>
        )}

        <p className="text-xs text-zinc-400">
          {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
