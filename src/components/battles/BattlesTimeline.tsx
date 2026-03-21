"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TIMELINE_EVENTS, TANK_CREWS } from "@/lib/battles-data";
import type { TimelineEvent } from "@/lib/battles-data";

function getTankColor(tankNumber: string): string {
  const crew = TANK_CREWS.find((c) => c.tankNumber === tankNumber);
  return crew?.color || "#666";
}

function EventCard({
  event,
  isExpanded,
  onToggle,
}: {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Timeline dot */}
      <div className="absolute -right-[29px] top-6 z-10 flex h-4 w-4 items-center justify-center">
        <div
          className="h-3 w-3 rounded-full border-2 border-white"
          style={{
            background:
              event.tankNumbers.length > 0
                ? getTankColor(event.tankNumbers[0])
                : "#556B2F",
          }}
        />
      </div>

      <div
        className={`cursor-pointer rounded-xl border p-5 transition-all ${
          isExpanded
            ? "border-olive/50 bg-dark-surface shadow-lg"
            : "border-dark-surface bg-dark-card hover:border-olive/30"
        }`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <span className="font-bold text-sand">{event.dateLabel}</span>
          <span className="text-gray-600">|</span>
          <span>{event.time}</span>
          <span className="text-gray-600">|</span>
          <span>{event.location.name}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-bold text-gray-200">{event.title}</h3>

        {/* Tank crew tags */}
        {event.tankNumbers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.tankNumbers.map((tn) => (
              <span
                key={tn}
                className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                style={{ background: getTankColor(tn) + "CC" }}
              >
                צ&apos; {tn}
              </span>
            ))}
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-dark-surface pt-4">
            <p className="leading-relaxed text-gray-300">{event.description}</p>
            {event.quote && (
              <blockquote className="border-r-4 border-olive pr-4">
                <p className="text-base italic text-sand/90">
                  &ldquo;{event.quote.text}&rdquo;
                </p>
                <cite className="mt-1 block text-sm not-italic text-gray-400">
                  — {event.quote.author}
                </cite>
              </blockquote>
            )}

            {/* WhatsApp Messages */}
            {event.whatsappMessages && event.whatsappMessages.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  💬 מתוך קבוצת הווטסאפ של הפלוגה
                </p>
                <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-lg bg-[#0B141A] p-3">
                  {event.whatsappMessages.map((msg, idx) => (
                    <div key={idx} className="rounded-lg bg-[#1F2C34] px-3 py-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#00A884]">{msg.sender}</span>
                        <span className="text-gray-500">{msg.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-200">{msg.text}</p>
                      {msg.audioFile && (
                        <audio controls className="mt-1.5 h-8 w-full" preload="none">
                          <source src={msg.audioFile} type="audio/ogg; codecs=opus" />
                        </audio>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BattlesTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group events by date label
  const eventsByDate: Record<string, TimelineEvent[]> = {};
  TIMELINE_EVENTS.forEach((evt) => {
    const key = evt.date;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(evt);
  });

  const sortedDates = Object.keys(eventsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section id="timeline" className="space-y-8">
      <h2 className="text-3xl font-black text-sand">ציר זמן</h2>
      <p className="text-gray-400">
        לחצו על כל אירוע כדי לקרוא פרטים נוספים
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {TANK_CREWS.map((crew) => (
          <div key={crew.tankNumber} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: crew.color }}
            />
            <span className="text-xs text-gray-400">
              צ&apos; {crew.tankNumber}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-10">
        {sortedDates.map((dateKey) => {
          const events = eventsByDate[dateKey];
          const dateObj = new Date(dateKey);
          const dayLabel = dateObj.toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div key={dateKey}>
              <h3 className="mb-4 text-xl font-bold text-olive-light">
                {dayLabel}
              </h3>
              <div className="relative border-r-2 border-olive/30 pr-8 space-y-4">
                {events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    isExpanded={expandedId === evt.id}
                    onToggle={() => toggleExpand(evt.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
