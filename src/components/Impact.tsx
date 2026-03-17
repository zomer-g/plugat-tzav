"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 120, label: "לוחמים פעילים", suffix: "+" },
  { value: 50, label: "אימונים בשנה", suffix: "+" },
  { value: 15, label: "שנות פעילות", suffix: "" },
  { value: 100, label: "אחוז מחויבות", suffix: "%" },
];

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

export default function Impact() {
  return (
    <section id="impact" aria-labelledby="impact-heading" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="impact-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          השפעתנו
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-200">
          המספרים מדברים בעד עצמם. הפלוגה גדלה ומתחזקת בזכותכם.
        </p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-mil/20 bg-dark-surface p-8 text-center"
              aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
            >
              <div className="mb-2 text-4xl font-black text-olive-light md:text-5xl">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium text-gray-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
