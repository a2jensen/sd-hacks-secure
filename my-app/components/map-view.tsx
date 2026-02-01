"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UCSD_CENTER, DEFAULT_ZOOM } from "@/constants/map";
import type { Incident, RiskLevel } from "@/types/incident";

const pinColors: Record<RiskLevel, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

function makeIcon(level: RiskLevel) {
  const color = pinColors[level];
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface MapViewProps {
  incidents: Incident[];
  onMapClick?: (lat: number, lng: number) => void;
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ incidents, onMapClick }: MapViewProps) {
  return (
    <MapContainer
      center={[UCSD_CENTER.lat, UCSD_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={makeIcon(incident.riskAssessment.level)}
        >
          <Popup maxWidth={250}>
            <div className="text-sm">
              {incident.photoUrl && (
                <img
                  src={incident.photoUrl}
                  alt="Incident photo"
                  className="mb-2 w-full rounded"
                  style={{ maxHeight: 150, objectFit: "cover" }}
                />
              )}
              <p className="font-semibold text-ucsd-navy">EyePop Analysis</p>
              <p>{incident.riskAssessment.summary}</p>
              {incident.description && (
                <p className="mt-1 border-t pt-1 text-zinc-700">
                  {incident.description}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                {incident.createdAt?.toDate
                  ? incident.createdAt.toDate().toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
