import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Impact from "@/components/Impact";
import Gallery from "@/components/Gallery";
import Timeline from "@/components/Timeline";
import Donation from "@/components/Donation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/db";

export default function Home() {
  const content = getSiteContent();

  return (
    <>
      {/* Skip to main content — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:rounded-lg focus:bg-sand focus:px-6 focus:py-3 focus:text-dark-bg focus:font-bold"
      >
        דלג לתוכן הראשי
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Impact content={content.impact} />
        <Gallery />
        <Timeline />
        <Donation />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
