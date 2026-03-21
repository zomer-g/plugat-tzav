"use client";

import dynamic from "next/dynamic";

const BattlesMap = dynamic(() => import("./BattlesMap"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-sand">מפת הקרבות</h2>
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-dark-surface bg-dark-card">
        <span className="text-gray-500">טוען מפה...</span>
      </div>
    </div>
  ),
});

export default function BattlesMapWrapper() {
  return <BattlesMap />;
}
