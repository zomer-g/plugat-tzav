"use client";

import { useState } from "react";
import { TANK_CREWS } from "@/lib/battles-data";
import type { TankCrew } from "@/lib/battles-data";

function CrewCard({ crew }: { crew: TankCrew }) {
  const [expanded, setExpanded] = useState(false);
  const [showFull, setShowFull] = useState(false);

  return (
    <div
      className="rounded-xl border-2 bg-dark-card transition-all"
      style={{ borderColor: crew.color + "80" }}
    >
      {/* Header */}
      <div
        className="cursor-pointer p-5"
        onClick={() => {
          setExpanded(!expanded);
          if (expanded) setShowFull(false);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
            if (expanded) setShowFull(false);
          }
        }}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Tank number badge */}
            <div className="mb-2 flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black text-white"
                style={{ background: crew.color }}
              >
                {crew.tankNumber}
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-200">
                  {crew.commander}
                </h3>
                <p className="text-sm text-gray-400">{crew.commanderRole}</p>
              </div>
            </div>

            {/* Crew members */}
            <div className="mt-3 space-y-1">
              {crew.crewMembers.map((member) => (
                <div
                  key={member.role + member.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-gray-500">{member.role}:</span>
                  <span className="text-gray-300">{member.name}</span>
                </div>
              ))}
            </div>

            {/* Battle area tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {crew.battleAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-dark-surface px-2.5 py-0.5 text-xs text-gray-400"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Expand indicator */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`mt-1 shrink-0 text-gray-500 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Expanded testimony */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: crew.color + "30" }}>
          <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">
            {showFull ? crew.testimonyFull : crew.testimonySummary}
          </p>
          {crew.testimonyFull !== crew.testimonySummary && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFull(!showFull);
              }}
              className="mt-3 text-sm font-bold transition-colors hover:text-sand"
              style={{ color: crew.color }}
            >
              {showFull ? "הצג פחות" : "קרא עוד"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CrewProfiles() {
  return (
    <section id="crews" className="space-y-8">
      <h2 className="text-3xl font-black text-sand">צוותי הטנקים</h2>
      <p className="text-gray-400">
        לחצו על כל צוות כדי לקרוא את הסיפור שלהם
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TANK_CREWS.map((crew) => (
          <CrewCard key={crew.tankNumber} crew={crew} />
        ))}
      </div>
    </section>
  );
}
