"use client";

import type { SiteContent } from "@/lib/db";

export default function ImpactDashboard({
  content,
}: {
  content: SiteContent["impactDashboard"];
}) {
  const percentage = content.totalGoal > 0
    ? Math.min(Math.round((content.totalRaised / content.totalGoal) * 100), 100)
    : 0;

  const maxCategoryAmount = Math.max(...content.categories.map((c) => c.amount), 1);

  return (
    <section id="impact-dashboard" className="py-20" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {content.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            {content.subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 rounded-2xl bg-dark-card p-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold text-sand">
                {content.currency}{content.totalRaised.toLocaleString()}
              </span>
              <span className="mr-2 text-gray-400">
                מתוך {content.currency}{content.totalGoal.toLocaleString()}
              </span>
            </div>
            <span className="text-2xl font-bold text-olive-light">{percentage}%</span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded-full bg-dark-surface">
            <div
              className="h-full rounded-full bg-gradient-to-l from-olive to-olive-light transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Category Breakdown */}
          <div className="rounded-2xl bg-dark-card p-8">
            <h3 className="mb-6 text-xl font-bold text-sand">לאן הולכות התרומות</h3>
            <div className="space-y-5">
              {content.categories.map((cat, idx) => {
                const catPct = maxCategoryAmount > 0
                  ? Math.round((cat.amount / maxCategoryAmount) * 100)
                  : 0;
                return (
                  <div key={idx}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-200">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-sm font-bold text-gray-400">
                        {content.currency}{cat.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-dark-surface">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${catPct}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="rounded-2xl bg-dark-card p-8">
            <h3 className="mb-6 text-xl font-bold text-sand">תרומות אחרונות</h3>
            {content.recentDonations.length === 0 ? (
              <p className="text-gray-500">עדיין אין תרומות</p>
            ) : (
              <div className="space-y-4">
                {content.recentDonations.slice(0, 5).map((donation, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-dark-surface p-4"
                  >
                    <div>
                      <p className="font-bold text-gray-200">{donation.name}</p>
                      {donation.message && (
                        <p className="mt-1 text-sm text-gray-400">
                          &ldquo;{donation.message}&rdquo;
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(donation.date).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-olive-light">
                      {content.currency}{donation.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {content.stats.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {content.stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-dark-card p-6 text-center"
              >
                <div className="mb-2 text-3xl">{stat.icon}</div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
