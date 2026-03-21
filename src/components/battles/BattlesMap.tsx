"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  TIMELINE_EVENTS,
  BATTLE_LOCATIONS,
  TANK_CREWS,
} from "@/lib/battles-data";
import type L from "leaflet";

function getTankColor(tankNumber: string): string {
  const crew = TANK_CREWS.find((c) => c.tankNumber === tankNumber);
  return crew?.color || "#556B2F";
}

export default function BattlesMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const events = TIMELINE_EVENTS;

  // Inject marker CSS
  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "battles-marker-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .leaflet-marker-icon.bm-hidden { opacity: 0 !important; transform: scale(0.5); pointer-events: none !important; }
        .leaflet-marker-icon.bm-dim { opacity: 0.75 !important; transition: opacity 0.6s ease !important; }
        .leaflet-marker-icon.bm-active { opacity: 1 !important; transition: opacity 0.6s ease !important; }
        .leaflet-marker-icon.bm-pulse { opacity: 1 !important; animation: bm-pulse-anim 0.6s ease-out !important; }
        @keyframes bm-pulse-anim {
          0% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const updateMarkerVisibility = useCallback(
    (currentIdx: number) => {
      if (!mapRef.current) return;
      events.forEach((event, eventIndex) => {
        const el = mapRef.current?.querySelector(
          `[data-bm-id="${event.id}"]`
        ) as HTMLElement | null;
        if (!el) return;
        const wrapper = el.closest(".leaflet-marker-icon") as HTMLElement | null;
        if (!wrapper) return;

        wrapper.classList.remove("bm-hidden", "bm-dim", "bm-active", "bm-pulse");

        if (currentIdx === -1) {
          wrapper.classList.add("bm-active");
        } else if (eventIndex === currentIdx) {
          wrapper.classList.add("bm-pulse");
        } else if (eventIndex < currentIdx) {
          wrapper.classList.add("bm-dim");
        } else {
          wrapper.classList.add("bm-hidden");
        }
      });
    },
    [events]
  );

  // Map init
  useEffect(() => {
    if (!mapRef.current) return;

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

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [31.35, 34.45],
        zoom: 10,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Add location markers for all battle sites (small labeled dots)
      const locationEntries = Object.entries(BATTLE_LOCATIONS);
      locationEntries.forEach(([, loc]) => {
        const locationIcon = L.divIcon({
          className: "",
          html: `<div style="
            background: rgba(85,107,47,0.8);
            width: 8px; height: 8px;
            border-radius: 50%;
            border: 1.5px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          "></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });

        L.marker([loc.lat, loc.lng], { icon: locationIcon })
          .addTo(map)
          .bindPopup(
            `<div dir="rtl" style="font-family: Heebo, sans-serif; text-align: right;">
              <strong>${loc.name}</strong>
            </div>`
          );
      });

      // Add event markers
      events.forEach((event) => {
        const mainColor =
          event.tankNumbers.length > 0
            ? getTankColor(event.tankNumbers[0])
            : "#556B2F";

        const tankLabel = event.tankNumbers.length > 0 ? event.tankNumbers[0] : "";
        const markerIcon = L.divIcon({
          className: "",
          html: `<div data-bm-id="${event.id}" style="
            position: relative;
            width: 40px; height: 48px;
            display: flex; flex-direction: column; align-items: center;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          ">
            ${tankLabel ? `<span style="
              background: ${mainColor};
              color: white;
              font-size: 9px;
              font-weight: bold;
              padding: 0 4px;
              border-radius: 4px;
              border: 1.5px solid white;
              line-height: 14px;
              white-space: nowrap;
              margin-bottom: 1px;
            ">${tankLabel}</span>` : ""}
            <svg viewBox="0 0 40 30" width="32" height="24">
              <rect x="8" y="12" width="24" height="10" rx="2" fill="${mainColor}" stroke="white" stroke-width="1.5"/>
              <rect x="5" y="18" width="30" height="6" rx="2" fill="${mainColor}" stroke="white" stroke-width="1"/>
              <rect x="14" y="4" width="12" height="10" rx="2" fill="${mainColor}" stroke="white" stroke-width="1.5"/>
              <rect x="26" y="7" width="12" height="3" rx="1" fill="${mainColor}" stroke="white" stroke-width="1"/>
            </svg>
          </div>`,
          iconSize: [40, 48],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([event.location.lat, event.location.lng], {
          icon: markerIcon,
        }).addTo(map);

        const tankTags = event.tankNumbers
          .map(
            (tn) =>
              `<span style="display:inline-block;background:${getTankColor(
                tn
              )};color:white;padding:1px 6px;border-radius:10px;font-size:11px;font-weight:bold;margin-left:4px;">צ' ${tn}</span>`
          )
          .join("");

        marker.bindPopup(
          `<div dir="rtl" style="font-family: Heebo, sans-serif; min-width: 220px; text-align: right;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">${event.dateLabel} | ${event.time}</p>
            <h3 style="margin:0 0 6px;font-size:15px;font-weight:bold;">${event.title}</h3>
            ${tankTags ? `<div style="margin-bottom:6px;">${tankTags}</div>` : ""}
            <p style="margin:0;font-size:13px;color:#ccc;">${event.description.slice(0, 120)}${event.description.length > 120 ? "..." : ""}</p>
            ${event.quote ? `<blockquote style="margin:8px 0 0;padding-right:8px;border-right:3px solid #556B2F;font-style:italic;color:#D4C89A;font-size:13px;">"${event.quote.text}"<br/><span style="font-style:normal;color:#999;font-size:11px;">— ${event.quote.author}</span></blockquote>` : ""}
          </div>`
        );

        markersRef.current.set(event.id, marker);
      });

      mapInstanceRef.current = map;

      setTimeout(() => updateMarkerVisibility(playbackIndex), 200);
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
  }, []);

  // Update markers when playback index changes
  useEffect(() => {
    updateMarkerVisibility(playbackIndex);

    if (playbackIndex >= 0 && playbackIndex < events.length) {
      const event = events[playbackIndex];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(
          [event.location.lat, event.location.lng],
          12,
          { animate: true, duration: 1 }
        );
      }
    }
  }, [playbackIndex, updateMarkerVisibility, events]);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlaybackIndex((prev) => {
          const next = prev + 1;
          if (next >= events.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 3000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, events.length]);

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (playbackIndex === -1 || playbackIndex >= events.length - 1) {
      setPlaybackIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  const currentEvent =
    playbackIndex >= 0 && playbackIndex < events.length
      ? events[playbackIndex]
      : null;

  return (
    <section id="map" className="space-y-6">
      <h2 className="text-3xl font-black text-sand">מפת הקרבות</h2>
      <p className="text-gray-400">
        לחצו על הסמנים במפה לפרטים, או הפעילו את ציר הזמן לצפייה בהתפתחות
        האירועים
      </p>

      <div
        ref={mapRef}
        className="h-[500px] w-full rounded-xl border border-dark-surface overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {/* Playback controls */}
      <div className="rounded-xl bg-dark-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
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

          {/* Stop */}
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

          {/* Slider */}
          <div className="flex-1 relative">
            <input
              type="range"
              min={-1}
              max={events.length - 1}
              value={playbackIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setPlaybackIndex(Number(e.target.value));
              }}
              className="w-full accent-olive cursor-pointer"
              dir="ltr"
            />
            <div
              className="flex justify-between text-[10px] text-gray-500 mt-1 px-1"
              dir="ltr"
            >
              <span>7 אוק&apos;</span>
              <span>10 אוק&apos;</span>
            </div>
          </div>

          {/* Counter */}
          <span className="text-sm text-gray-400 shrink-0 min-w-[60px] text-center">
            {playbackIndex >= 0
              ? `${playbackIndex + 1} / ${events.length}`
              : `${events.length}`}
          </span>
        </div>

        {/* Current event info */}
        {currentEvent && (
          <div className="flex items-start gap-3 rounded-lg bg-dark-surface/50 p-3 transition-all">
            <div
              className="mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background:
                  currentEvent.tankNumbers.length > 0
                    ? getTankColor(currentEvent.tankNumbers[0])
                    : "#556B2F",
              }}
            >
              {currentEvent.tankNumbers[0] || ""}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-200">
                {currentEvent.title}
              </div>
              <div className="text-xs text-gray-400">
                {currentEvent.dateLabel} | {currentEvent.time} —{" "}
                {currentEvent.location.name}
              </div>
              <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                {currentEvent.description}
              </p>
              {currentEvent.quote && (
                <blockquote className="mt-2 border-r-2 border-olive pr-3">
                  <p className="text-sm italic text-sand/80">
                    &ldquo;{currentEvent.quote.text}&rdquo;
                  </p>
                  <cite className="text-xs not-italic text-gray-500">
                    — {currentEvent.quote.author}
                  </cite>
                </blockquote>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
