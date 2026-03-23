import { getSoldiers } from "@/lib/db";
import SoldiersMapDisplay from "./SoldiersMapDisplay";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "מפת חיילים | פלוגת צב",
  description: "חיילי הפלוגה על המפה",
};

export default function SoldiersMapPage() {
  const soldiers = getSoldiers();
  const withCoords = soldiers.filter((s) => s.coordinates);
  const withoutCoords = soldiers.length - withCoords.length;

  // Only pass name + city + coordinates for privacy
  const mapSoldiers = withCoords.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city || "",
    coordinates: s.coordinates!,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sand">📍 מפת חיילים</h1>
        <p className="mt-2 text-gray-400">
          חיילי הפלוגה על המפה
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-olive/20 px-3 py-1 text-olive-light">
            {withCoords.length} חיילים על המפה
          </span>
          {withoutCoords > 0 && (
            <span className="rounded-full bg-dark-surface px-3 py-1 text-gray-400">
              {withoutCoords} ללא מיקום
            </span>
          )}
        </div>
      </div>
      <SoldiersMapDisplay soldiers={mapSoldiers} />
    </div>
  );
}
