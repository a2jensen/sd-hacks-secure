import Image from "next/image";
import { RiskBadge } from "./risk-badge";
import type { Incident } from "@/types/incident";

export function IncidentCard({ incident }: { incident: Incident }) {
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
    <div className="flex gap-4 rounded-lg border p-4">
      {incident.photoUrl && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
          <Image
            src={incident.photoUrl}
            alt="Incident photo"
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <RiskBadge level={incident.riskAssessment.level} />
          <span className="text-xs text-zinc-400">{timeStr}</span>
        </div>
        <p className="text-xs font-semibold text-ucsd-navy">EyePop Analysis</p>
        <p className="text-sm text-zinc-700">
          {incident.riskAssessment.summary}
        </p>
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
