import BattlesHero from "@/components/battles/BattlesHero";
import BattlesTimeline from "@/components/battles/BattlesTimeline";
import CrewProfiles from "@/components/battles/CrewProfiles";
import BattlesMapWrapper from "@/components/battles/BattlesMapWrapper";

export const metadata = {
  title: "קרבות בלימה | פלוגת צב",
  description:
    "הסיפור של צוותי הטנקים של פלוגה א' בקרבות הבלימה, 7-10 באוקטובר 2023",
};

export default function BattlesPage() {
  return (
    <div className="space-y-16">
      <BattlesHero />
      <CrewProfiles />
      <BattlesMapWrapper />
      <BattlesTimeline />
    </div>
  );
}
