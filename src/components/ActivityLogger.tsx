"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ActivityLogger() {
  const pathname = usePathname();

  useEffect(() => {
    // Log page visit for logged-in users
    fetch("/api/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
    }).catch(() => {
      // Silently fail — logging should never break the app
    });
  }, [pathname]);

  return null; // This component renders nothing
}
