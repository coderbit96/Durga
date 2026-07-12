"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeoPoint } from "@/domain";

const LazyMapView = dynamic(
  () => import("@/components/maps/map-view").then((module) => module.MapView),
  {
    loading: () => <Skeleton className="h-80" />,
    ssr: false,
  },
);

type PujaMapSectionProps = {
  label: string;
  point: GeoPoint;
};

export function PujaMapSection({ label, point }: PujaMapSectionProps) {
  return (
    <LazyMapView
      markers={[
        {
          id: label,
          label,
          point,
        },
      ]}
      routePoints={[point]}
    />
  );
}
