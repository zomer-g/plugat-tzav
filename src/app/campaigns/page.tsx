import { getCampaigns } from "@/lib/db";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const campaigns = getCampaigns().filter((c) => c.active);

  return (
    <div className="min-h-screen bg-dark-bg" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">קמפיינים פעילים</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            עזרו לנו להגיע ליעד — כל תרומה עושה שינוי
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl bg-dark-card p-16 text-center">
            <p className="text-xl text-gray-500">אין קמפיינים פעילים כרגע</p>
            <Link href="/" className="mt-4 inline-block text-olive-light hover:underline">
              חזרה לעמוד הראשי
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                slug={campaign.slug}
                title={campaign.title}
                goal={campaign.goal}
                raised={campaign.raised}
                currency={campaign.currency}
                endDate={campaign.endDate}
                image={campaign.image}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-400 hover:text-sand transition-colors">
            &larr; חזרה לעמוד הראשי
          </Link>
        </div>
      </div>
    </div>
  );
}
