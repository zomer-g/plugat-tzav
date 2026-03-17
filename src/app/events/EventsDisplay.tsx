"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface EventData {
  id: string;
  title: string;
  type: "training" | "operational" | "social" | "uniform";
  startDate: string;
  endDate?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  albumUrl?: string;
}

const TYPE_INFO: Record<
  string,
  { label: string; color: string; markerColor: string; icon: string }
> = {
  training: { label: "אימון", color: "border-blue-500 bg-blue-900/20", markerColor: "#3B82F6", icon: "🎯" },
  operational: { label: "פעילות מבצעית", color: "border-red-500 bg-red-900/20", markerColor: "#EF4444", icon: "⚔️" },
  social: { label: "פעילות חברתית", color: "border-green-500 bg-green-900/20", markerColor: "#22C55E", icon: "🤝" },
  uniform: { label: "מדים", color: "border-purple-500 bg-purple-900/20", markerColor: "#A855F7", icon: "👔" },
};

export default function EventsDisplay() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [view, setView] = useState<"timeline" | "map">("timeline");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Map initialization
  useEffect(() => {
    if (view !== "map" || !mapRef.current || events.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const filtered = filteredEvents;
    const withCoords = filtered.filter((e) => e.coordinates);

    // Center on Israel
    const map = L.map(mapRef.current, {
      center: [31.5, 34.8],
      zoom: 8,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Add markers
    withCoords.forEach((event) => {
      if (!event.coordinates) return;
      const typeInfo = TYPE_INFO[event.type] || TYPE_INFO.training;

      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${typeInfo.markerColor};
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">${typeInfo.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([event.coordinates.lat, event.coordinates.lng], {
        icon: markerIcon,
      }).addTo(map);

      const dateStr = new Date(event.startDate).toLocaleDateString("he-IL");
      const popupContent = `
        <div dir="rtl" style="font-family: Heebo, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: bold;">${event.title}</h3>
          <p style="margin: 0 0 4px; color: #666; font-size: 13px;">📍 ${event.location}</p>
          <p style="margin: 0 0 4px; color: #666; font-size: 13px;">📅 ${dateStr}</p>
          <span style="
            display: inline-block;
            background: ${typeInfo.markerColor}22;
            color: ${typeInfo.markerColor};
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          ">${typeInfo.icon} ${typeInfo.label}</span>
          ${event.description ? `<p style="margin: 8px 0 4px; font-size: 13px;">${event.description.slice(0, 100)}${event.description.length > 100 ? "..." : ""}</p>` : ""}
          ${event.albumUrl ? `<a href="${event.albumUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 6px; color: #556B2F; font-size: 13px; text-decoration: underline;">📸 לאלבום תמונות</a>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        setSelectedEvent(event.id);
      });
    });

    // Fit bounds if we have markers
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(
        withCoords.map((e) => [e.coordinates!.lat, e.coordinates!.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, events, selectedType]);

  const filteredEvents =
    selectedType === "all"
      ? events
      : events.filter((e) => e.type === selectedType);

  // Group events by year for timeline
  const eventsByYear: Record<string, EventData[]> = {};
  filteredEvents
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .forEach((e) => {
      const year = new Date(e.startDate).getFullYear().toString();
      if (!eventsByYear[year]) eventsByYear[year] = [];
      eventsByYear[year].push(e);
    });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-400">טוען אירועים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-2">אין גישה</p>
          <p className="text-gray-500">יש להתחבר כדי לצפות באירועים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              selectedType === "all"
                ? "bg-sand text-dark-bg"
                : "bg-dark-card text-gray-400 hover:text-sand"
            }`}
          >
            הכל ({events.length})
          </button>
          {Object.entries(TYPE_INFO).map(([key, val]) => {
            const count = events.filter((e) => e.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  selectedType === key
                    ? "bg-sand text-dark-bg"
                    : "bg-dark-card text-gray-400 hover:text-sand"
                }`}
              >
                {val.icon} {val.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl bg-dark-card p-1">
          <button
            onClick={() => setView("timeline")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              view === "timeline"
                ? "bg-olive text-white"
                : "text-gray-400 hover:text-sand"
            }`}
          >
            📋 ציר זמן
          </button>
          <button
            onClick={() => setView("map")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              view === "map"
                ? "bg-olive text-white"
                : "text-gray-400 hover:text-sand"
            }`}
          >
            🗺️ מפה
          </button>
        </div>
      </div>

      {/* Map view */}
      {view === "map" && (
        <div className="space-y-4">
          <div
            ref={mapRef}
            className="h-[500px] w-full rounded-xl border border-dark-surface overflow-hidden"
            style={{ zIndex: 0 }}
          />
          {filteredEvents.filter((e) => !e.coordinates).length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              {filteredEvents.filter((e) => !e.coordinates).length} אירועים ללא קואורדינטות לא מוצגים במפה
            </p>
          )}
        </div>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <div className="space-y-8">
          {Object.keys(eventsByYear).length === 0 ? (
            <div className="rounded-xl bg-dark-card p-12 text-center text-gray-500">
              אין אירועים להצגה
            </div>
          ) : (
            Object.entries(eventsByYear).map(([year, yearEvents]) => (
              <div key={year}>
                <h3 className="mb-4 text-2xl font-bold text-sand">{year}</h3>
                <div className="relative border-r-2 border-olive/40 pr-8 space-y-6">
                  {yearEvents.map((event) => {
                    const typeInfo = TYPE_INFO[event.type] || TYPE_INFO.training;
                    const isSelected = selectedEvent === event.id;
                    return (
                      <div
                        key={event.id}
                        className={`relative rounded-xl border p-5 transition-all cursor-pointer ${
                          isSelected
                            ? `${typeInfo.color} border-opacity-100 shadow-lg`
                            : "border-dark-surface bg-dark-card hover:border-olive/50"
                        }`}
                        onClick={() =>
                          setSelectedEvent(isSelected ? null : event.id)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedEvent(isSelected ? null : event.id);
                          }
                        }}
                        aria-expanded={isSelected}
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute -right-[calc(2rem+5px)] top-6 h-3 w-3 rounded-full border-2 border-white"
                          style={{ background: typeInfo.markerColor }}
                        />

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-lg font-bold text-gray-200">
                                {event.title}
                              </h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${typeInfo.color}`}
                              >
                                {typeInfo.icon} {typeInfo.label}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                              <span>
                                📅{" "}
                                {new Date(event.startDate).toLocaleDateString(
                                  "he-IL"
                                )}
                                {event.endDate && (
                                  <>
                                    {" "}
                                    —{" "}
                                    {new Date(event.endDate).toLocaleDateString(
                                      "he-IL"
                                    )}
                                  </>
                                )}
                              </span>
                              <span>📍 {event.location}</span>
                              {event.coordinates && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setView("map");
                                  }}
                                  className="text-olive-light hover:underline"
                                >
                                  🗺️ הצג במפה
                                </button>
                              )}
                            </div>
                          </div>

                          {event.albumUrl && (
                            <a
                              href={event.albumUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-olive/20 px-4 py-2 text-sm font-bold text-olive-light transition-colors hover:bg-olive/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📸 אלבום תמונות
                            </a>
                          )}
                        </div>

                        {/* Expanded content */}
                        {isSelected && event.description && (
                          <div className="mt-4 border-t border-dark-surface pt-4">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
