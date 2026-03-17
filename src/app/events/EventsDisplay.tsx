"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type L from "leaflet";

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
  const leafletRef = useRef<typeof L | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(-1); // -1 = show all
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const filteredEvents =
    selectedType === "all"
      ? events
      : events.filter((e) => e.type === selectedType);

  // Sort chronologically (oldest first) for map playback
  const sortedEventsAsc = [...filteredEvents].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const eventsWithCoords = sortedEventsAsc.filter((e) => e.coordinates);

  // Update marker opacity based on playback position
  const updateMarkerOpacity = useCallback((currentIdx: number) => {
    markersRef.current.forEach((marker, eventId) => {
      const el = (marker as unknown as { _icon?: HTMLElement })._icon;
      if (!el) return;

      if (currentIdx === -1) {
        // Show all at full opacity
        el.style.opacity = "1";
        el.style.transition = "opacity 0.6s ease";
        return;
      }

      const eventIndex = eventsWithCoords.findIndex((e) => e.id === eventId);
      if (eventIndex < 0) return;

      if (eventIndex === currentIdx) {
        // Current event: full opacity with scale animation
        el.style.opacity = "1";
        el.style.transition = "opacity 0.6s ease, transform 0.4s ease";
        el.style.transform = "scale(1.3)";
        setTimeout(() => {
          el.style.transform = "scale(1)";
        }, 400);
      } else if (eventIndex < currentIdx) {
        // Past events: 25% opacity (75% transparent)
        el.style.opacity = "0.25";
        el.style.transition = "opacity 0.6s ease";
        el.style.transform = "scale(1)";
      } else {
        // Future events: hidden
        el.style.opacity = "0";
        el.style.transition = "opacity 0.3s ease";
        el.style.transform = "scale(1)";
      }
    });
  }, [eventsWithCoords]);

  // Map initialization
  useEffect(() => {
    if (view !== "map" || !mapRef.current || events.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    markersRef.current.clear();

    let cancelled = false;

    import("leaflet").then((leafletModule) => {
      // @ts-expect-error CSS import for side effects
      import("leaflet/dist/leaflet.css").catch(() => {});
      const L = leafletModule.default;
      leafletRef.current = L;

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

      // Add all markers
      eventsWithCoords.forEach((event) => {
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
        marker.on("click", () => setSelectedEvent(event.id));
        markersRef.current.set(event.id, marker);
      });

      // Fit bounds
      if (eventsWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          eventsWithCoords.map((e) => [e.coordinates!.lat, e.coordinates!.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }

      mapInstanceRef.current = map;

      // Apply current playback state
      updateMarkerOpacity(playbackIndex);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, events, selectedType]);

  // Update markers when playback index changes
  useEffect(() => {
    updateMarkerOpacity(playbackIndex);

    // Pan to current event
    if (playbackIndex >= 0 && playbackIndex < eventsWithCoords.length) {
      const event = eventsWithCoords[playbackIndex];
      if (event.coordinates && mapInstanceRef.current) {
        mapInstanceRef.current.panTo(
          [event.coordinates.lat, event.coordinates.lng],
          { animate: true, duration: 0.5 }
        );
      }
    }
  }, [playbackIndex, updateMarkerOpacity, eventsWithCoords]);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlaybackIndex((prev) => {
          const next = prev + 1;
          if (next >= eventsWithCoords.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 2000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, eventsWithCoords.length]);

  const startPlayback = () => {
    setPlaybackIndex(0);
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (playbackIndex === -1 || playbackIndex >= eventsWithCoords.length - 1) {
      startPlayback();
    } else {
      setIsPlaying(true);
    }
  };

  // Group events by year for timeline (newest first)
  const eventsByYear: Record<string, EventData[]> = {};
  [...filteredEvents]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .forEach((e) => {
      const year = new Date(e.startDate).getFullYear().toString();
      if (!eventsByYear[year]) eventsByYear[year] = [];
      eventsByYear[year].push(e);
    });

  // Sort year keys descending
  const sortedYears = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

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

  const currentPlaybackEvent =
    playbackIndex >= 0 && playbackIndex < eventsWithCoords.length
      ? eventsWithCoords[playbackIndex]
      : null;

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
            onClick={() => { setView("timeline"); stopPlayback(); }}
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

          {/* Playback controls */}
          {eventsWithCoords.length > 0 && (
            <div className="rounded-xl bg-dark-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Play/Pause button */}
                <button
                  onClick={togglePlayPause}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive text-white transition-colors hover:bg-olive-light"
                  aria-label={isPlaying ? "השהה" : "הפעל"}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="3" y="2" width="4" height="12" rx="1" />
                      <rect x="9" y="2" width="4" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2l10 6-10 6V2z" />
                    </svg>
                  )}
                </button>

                {/* Stop button */}
                {playbackIndex >= 0 && (
                  <button
                    onClick={stopPlayback}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-surface text-gray-400 transition-colors hover:text-white"
                    aria-label="עצור"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <rect x="2" y="2" width="10" height="10" rx="1" />
                    </svg>
                  </button>
                )}

                {/* Timeline slider */}
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={-1}
                    max={eventsWithCoords.length - 1}
                    value={playbackIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setPlaybackIndex(Number(e.target.value));
                    }}
                    className="w-full accent-olive cursor-pointer"
                    dir="ltr"
                  />
                  {/* Year markers on slider */}
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1" dir="ltr">
                    {eventsWithCoords.length > 0 && (
                      <>
                        <span>{new Date(eventsWithCoords[0].startDate).getFullYear()}</span>
                        <span>{new Date(eventsWithCoords[eventsWithCoords.length - 1].startDate).getFullYear()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Event counter */}
                <span className="text-sm text-gray-400 shrink-0 min-w-[60px] text-center">
                  {playbackIndex >= 0
                    ? `${playbackIndex + 1} / ${eventsWithCoords.length}`
                    : `${eventsWithCoords.length}`}
                </span>
              </div>

              {/* Current event info */}
              {currentPlaybackEvent && (
                <div className="flex items-center gap-3 rounded-lg bg-dark-surface/50 p-3 transition-all">
                  <div
                    className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm"
                    style={{ background: TYPE_INFO[currentPlaybackEvent.type]?.markerColor || "#666" }}
                  >
                    {TYPE_INFO[currentPlaybackEvent.type]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-200 truncate">
                      {currentPlaybackEvent.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(currentPlaybackEvent.startDate).toLocaleDateString("he-IL")} — {currentPlaybackEvent.location}
                    </div>
                  </div>
                  {currentPlaybackEvent.albumUrl && (
                    <a
                      href={currentPlaybackEvent.albumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm text-olive-light hover:underline"
                    >
                      📸
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {filteredEvents.filter((e) => !e.coordinates).length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              {filteredEvents.filter((e) => !e.coordinates).length} אירועים ללא קואורדינטות לא מוצגים במפה
            </p>
          )}
        </div>
      )}

      {/* Timeline view — newest first */}
      {view === "timeline" && (
        <div className="space-y-8">
          {sortedYears.length === 0 ? (
            <div className="rounded-xl bg-dark-card p-12 text-center text-gray-500">
              אין אירועים להצגה
            </div>
          ) : (
            sortedYears.map((year) => (
              <div key={year}>
                <h3 className="mb-4 text-2xl font-bold text-sand">{year}</h3>
                <div className="relative border-r-2 border-olive/40 pr-8 space-y-6">
                  {eventsByYear[year].map((event) => {
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
