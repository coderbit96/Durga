import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoneListing } from "@/components/pujas/zone-listing";

export const metadata = {
  alternates: { canonical: "/pujas/north-kolkata" },
  description:
    "Explore North Kolkata Durga Puja pandals, heritage routes, famous stops, and neighborhood gems.",
  openGraph: {
    description:
      "Explore North Kolkata Durga Puja pandals, heritage routes, famous stops, and neighborhood gems.",
    title: "North Kolkata Pujas | PujoPath Kolkata",
    url: "/pujas/north-kolkata",
  },
  title: "North Kolkata Pujas",
};

export default function NorthKolkataPujasPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-10 h-96 max-w-7xl" />}>
      <ZoneListing
        description="Heritage lanes, bonedi bari energy, market-area classics, and tightly linked pandal stops."
        title="North Kolkata pujas"
        zone="north-kolkata"
      />
    </Suspense>
  );
}
