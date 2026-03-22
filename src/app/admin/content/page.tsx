import { getSiteContent, getPageLayout } from "@/lib/db";
import ContentManagement from "./ContentManagement";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const content = getSiteContent();
  const layout = getPageLayout("main");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">✏️ עריכת תוכן האתר</h1>
        <p className="mt-1 text-gray-400">
          עריכת תוכן, סידור סקשנים, הסתרה והוספה — כל שינוי משפיע על העמוד הראשי
        </p>
      </div>

      <ContentManagement initialContent={content} initialLayout={layout} />
    </div>
  );
}
