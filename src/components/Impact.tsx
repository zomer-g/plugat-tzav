"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/db";

function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          if (prefersReduced) {
            setCount(target);
            return;
          }

          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/** Parse a stat value like "120+" or "100%" into numeric target + suffix */
function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return { target: parseInt(match[1], 10), suffix: match[2] };
  }
  return { target: 0, suffix: value };
}

export default function Impact({ content }: { content: SiteContent["impact"] }) {
  return (
    <section id="impact" aria-labelledby="impact-heading" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="impact-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.title}
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-200">
          {content.subtitle}
        </p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {content.stats.map((stat) => {
            const { target, suffix } = parseStatValue(stat.value);
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-mil/20 bg-dark-surface p-8 text-center"
                aria-label={`${stat.value} ${stat.label}`}
              >
                <div className="mb-2 text-4xl font-black text-olive-light md:text-5xl">
                  <AnimatedNumber target={target} suffix={suffix} />
                </div>
                <div className="text-sm font-medium text-gray-200">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
