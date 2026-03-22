import type { SiteContent } from "@/lib/db";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Impact from "@/components/Impact";
import Gallery from "@/components/Gallery";
import Timeline from "@/components/Timeline";
import Donation from "@/components/Donation";
import Contact from "@/components/Contact";

export interface SectionMeta {
  type: string;
  label: string;
  icon: string;
}

export const SECTION_TYPES: SectionMeta[] = [
  { type: "hero", label: "חלק ראשי (Hero)", icon: "🏠" },
  { type: "about", label: "אודות", icon: "ℹ️" },
  { type: "impact", label: "השפעתנו", icon: "📊" },
  { type: "gallery", label: "עדכונים וגלריה", icon: "🖼️" },
  { type: "timeline", label: "ציר הזמן", icon: "📅" },
  { type: "donation", label: "תרומות", icon: "💰" },
  { type: "contact", label: "צור קשר", icon: "📧" },
];

export function getSectionMeta(type: string): SectionMeta {
  return SECTION_TYPES.find((s) => s.type === type) || { type, label: type, icon: "📄" };
}

export function renderSection(type: string, content: SiteContent): React.ReactNode {
  switch (type) {
    case "hero":
      return <Hero content={content.hero} />;
    case "about":
      return <About content={content.about} />;
    case "impact":
      return <Impact content={content.impact} />;
    case "gallery":
      return <Gallery content={content.gallery} />;
    case "timeline":
      return <Timeline content={content.timeline} />;
    case "donation":
      return <Donation content={content.donation} />;
    case "contact":
      return <Contact content={content.contact} />;
    default:
      return null;
  }
}
