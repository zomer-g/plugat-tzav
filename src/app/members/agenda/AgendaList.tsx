"use client";

import { useState } from "react";

interface AgendaItem {
  date: string;
  type: "event" | "birthday" | "anniversary";
  title: string;
  description: string;
  icon: string;
}

const TYPE_COLORS: Record<string, string> = {
  event: "border-blue-500/30 bg-blue-900/10",
  birthday: "border-amber-500/30 bg-amber-900/10",
  anniversary: "border-purple-500/30 bg-purple-900/10",
};

const TYPE_LABELS: Record<string, string> = {
  event: "אירוע",
  birthday: "יום הולדת",
  anniversary: "יום שנה",
};

export default function AgendaList({ items }: { items: AgendaItem[] }) {
  const [showCount, setShowCount] = useState(20);

  const visible = items.slice(0, showCount);

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-dark-card p-12 text-center text-gray-500">
        אין אירועים קרובים להצגה
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((item, i) => {
        const dateStr = new Date(item.date).toLocaleDateString("he-IL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return (
          <div
            key={`${item.type}-${item.date}-${i}`}
            className={`rounded-xl border p-4 transition-all ${TYPE_COLORS[item.type] || "border-dark-surface bg-dark-card"}`}
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-200">{item.title}</h3>
                  <span className="rounded-full bg-dark-surface px-2 py-0.5 text-xs text-gray-400">
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{dateStr}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showCount < items.length && (
        <button
          onClick={() => setShowCount((c) => c + 20)}
          className="w-full rounded-xl border border-dark-surface bg-dark-card py-3 text-center text-sm font-bold text-sand transition-colors hover:bg-dark-surface"
        >
          הצג עוד ({items.length - showCount} נוספים)
        </button>
      )}
    </div>
  );
}
