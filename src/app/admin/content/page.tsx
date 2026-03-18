import { getSiteContent } from "@/lib/db";
import ContentManagement from "./ContentManagement";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const content = getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">✏️ עריכת תוכן האתר</h1>
        <p className="mt-1 text-gray-400">
          עריכת הטקסטים המוצגים בעמוד הראשי של האתר
        </p>
      </div>

      <ContentManagement initialContent={content} />
    </div>
  );
}
