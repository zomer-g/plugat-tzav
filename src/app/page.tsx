import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent, getPageLayout } from "@/lib/db";
import { renderSection } from "@/lib/section-registry";

export default function Home() {
  const content = getSiteContent();
  const layout = getPageLayout("main");
  const sections = layout.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Skip to main content — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:rounded-lg focus:bg-sand focus:px-6 focus:py-3 focus:text-dark-bg focus:font-bold"
      >
        דלג לתוכן הראשי
      </a>
      <Navbar content={content.navbar} />
      <main id="main-content">
        {sections.map((section) => (
          <div key={section.id}>{renderSection(section.type, content)}</div>
        ))}
      </main>
      <Footer content={content.footer} />
    </>
  );
}
