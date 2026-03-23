import Link from "next/link";

interface CampaignCardProps {
  slug: string;
  title: string;
  goal: number;
  raised: number;
  currency: string;
  endDate?: string;
  image?: string;
}

export default function CampaignCard({
  slug,
  title,
  goal,
  raised,
  currency,
  endDate,
  image,
}: CampaignCardProps) {
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  const daysRemaining = endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Link
      href={`/campaigns/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-dark-surface bg-dark-card transition-all hover:border-olive hover:shadow-lg"
    >
      {/* Image / gradient header */}
      {image ? (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <div className="h-40 bg-gradient-to-bl from-olive-dark to-dark-surface" />
      )}

      <div className="p-6">
        <h3 className="mb-4 text-xl font-bold text-white group-hover:text-sand transition-colors">
          {title}
        </h3>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-dark-surface">
            <div
              className="h-full rounded-full bg-gradient-to-l from-olive to-olive-light transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            <span className="font-bold text-white">{currency}{raised.toLocaleString()}</span>
            {" "}מתוך {currency}{goal.toLocaleString()}
          </span>
          <span className="font-bold text-olive-light">{pct}%</span>
        </div>

        {daysRemaining !== null && (
          <p className="mt-3 text-sm text-gray-500">
            {daysRemaining > 0 ? `${daysRemaining} ימים נותרו` : "הקמפיין הסתיים"}
          </p>
        )}
      </div>
    </Link>
  );
}
