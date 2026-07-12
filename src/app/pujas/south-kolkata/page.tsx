import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoneListing } from "@/components/pujas/zone-listing";

export const metadata = {
  alternates: { canonical: "/pujas/south-kolkata" },
  description:
    "Explore South Kolkata Durga Puja pandals, theme routes, family-friendly stops, and famous parks.",
  openGraph: {
    description:
      "Explore South Kolkata Durga Puja pandals, theme routes, family-friendly stops, and famous parks.",
    title: "South Kolkata Pujas | PujoPath Kolkata",
    url: "/pujas/south-kolkata",
  },
  title: "South Kolkata Pujas",
};

export default function SouthKolkataPujasPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-10 h-96 max-w-7xl" />}>
      <ZoneListing
        description="Theme-led installations, food-friendly connectors, big-name parks, and quieter neighborhood stops."
        title="South Kolkata pujas"
        zone="south-kolkata"
      />
    </Suspense>
  );
}
