"use client";

import { useMemo } from "react";
import type { GeoPoint } from "@/domain";
import { Card } from "@/components/ui/card";
import { Marker } from "./marker";
import { RoutePolyline } from "./route-polyline";

type MapViewProps = {
  error?: string;
  loading?: boolean;
  markers: Array<{
    id: string;
    label: string;
    point: GeoPoint;
  }>;
  routePoints?: GeoPoint[];
};

export function MapView({ error, loading = false, markers, routePoints = [] }: MapViewProps) {
  const clustered = useMemo(() => markers.length > 12, [markers.length]);

  return (
    <Card className="overflow-hidden">
      <div className="festival-sheen min-h-80 bg-[#090907] p-4 text-foreground">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Map preview</p>
            <p className="text-xs text-muted-foreground">
              Provider-independent map surface. External map JavaScript is not
              loaded on pages without maps.
            </p>
          </div>
          {clustered ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              Clustered
            </span>
          ) : null}
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading map...</p> : null}
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        {!loading && !error ? (
          <div className="space-y-3">
            <RoutePolyline points={routePoints} />
            <div className="grid gap-2 md:grid-cols-2">
              {markers.map((marker) => (
                <Marker key={marker.id} label={marker.label} point={marker.point} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
