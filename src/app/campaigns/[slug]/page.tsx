import { getCampaigns, getCampaignBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const pct = campaign.goal > 0
    ? Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100)
    : 0;

  const daysRemaining = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const links = campaign.paymentLinks?.filter((l) => l.url) || [];

  return (
    <div className="min-h-screen bg-dark-bg" dir="rtl">
      {/* Hero */}
      <div
        className="relative flex min-h-[300px] items-end md:min-h-[400px]"
        style={{
          background: campaign.image
            ? `linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0.5) 50%, rgba(17,17,17,0.3) 100%), url(${campaign.image}) center/cover no-repeat`
            : "linear-gradient(135deg, #556B2F 0%, #1a1a1a 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-4xl px-4 pb-8">
          <h1 className="text-4xl font-bold text-white md:text-5xl">{campaign.title}</h1>
          {daysRemaining !== null && (
            <p className="mt-3 text-lg text-gray-300">
              {daysRemaining > 0 ? (
                <span>{daysRemaining} ימים נותרו לסיום הקמפיין</span>
              ) : (
                <span className="text-red-400">הקמפיין הסתיים</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Progress */}
        <div className="mb-10 rounded-2xl bg-dark-card p-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold text-sand">
                {campaign.currency}{campaign.raised.toLocaleString()}
              </span>
              <span className="mr-2 text-gray-400">
                מתוך {campaign.currency}{campaign.goal.toLocaleString()}
              </span>
            </div>
            <span className="text-2xl font-bold text-olive-light">{pct}%</span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded-full bg-dark-surface">
            <div
              className="h-full rounded-full bg-gradient-to-l from-olive to-olive-light"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-10">
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {campaign.description}
          </div>
        </div>

        {/* Payment Buttons */}
        {links.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-sand">תרמו עכשיו</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full px-8 py-4 text-center text-lg font-bold transition-all ${
                    idx === 0
                      ? "bg-olive text-white hover:bg-olive-light hover:shadow-lg"
                      : "border-2 border-sand text-sand hover:bg-sand/10"
                  }`}
                >
                  {link.icon && <span className="ml-2">{link.icon}</span>}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-10 rounded-2xl bg-dark-card p-8">
          <h2 className="mb-4 text-xl font-bold text-sand">שתפו וגייסו</h2>
          <p className="mb-6 text-gray-400">
            שתפו את הקמפיין עם חברים ומשפחה כדי לעזור לנו להגיע ליעד
          </p>
          <ShareButtons
            title={campaign.title}
            shareText={campaign.shareText}
            slug={campaign.slug}
          />
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/campaigns" className="text-gray-400 hover:text-sand transition-colors">
            &larr; חזרה לכל הקמפיינים
          </Link>
        </div>
      </div>
    </div>
  );
}
