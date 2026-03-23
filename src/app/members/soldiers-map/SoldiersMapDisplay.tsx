"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";

interface MapSoldier {
  id: string;
  name: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export default function SoldiersMapDisplay({ soldiers }: { soldiers: MapSoldier[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || soldiers.length === 0) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let cancelled = false;

    import("leaflet").then((leafletModule) => {
      // @ts-expect-error CSS import for side effects
      import("leaflet/dist/leaflet.css").catch(() => {});
      const L = leafletModule.default;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [31.5, 34.8],
        zoom: 8,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Group soldiers by coordinates (same city = same pin)
      const groups = new Map<string, MapSoldier[]>();
      for (const s of soldiers) {
        const key = `${s.coordinates.lat.toFixed(3)},${s.coordinates.lng.toFixed(3)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(s);
      }

      groups.forEach((group) => {
        const first = group[0];
        const markerIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background: #556B2F;
            width: 32px; height: 32px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; font-weight: bold;
            color: white;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          ">${group.length > 1 ? group.length : "📍"}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([first.coordinates.lat, first.coordinates.lng], {
          icon: markerIcon,
        }).addTo(map);

        const namesHtml = group
          .map((s) => `<div style="padding: 2px 0;">${s.name}${s.city ? ` — ${s.city}` : ""}</div>`)
          .join("");

        marker.bindPopup(
          `<div dir="rtl" style="font-family: Heebo, sans-serif; min-width: 150px;">
            <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: bold;">${first.city || "מיקום"}</h3>
            <div style="font-size: 13px; color: #333;">${namesHtml}</div>
          </div>`
        );
      });

      // Fit bounds
      if (soldiers.length > 0) {
        const bounds = L.latLngBounds(
          soldiers.map((s) => [s.coordinates.lat, s.coordinates.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [soldiers]);

  if (soldiers.length === 0) {
    return (
      <div className="rounded-xl bg-dark-card p-12 text-center text-gray-500">
        אין חיילים עם מיקום להצגה על המפה
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[600px] w-full rounded-xl border border-dark-surface overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
