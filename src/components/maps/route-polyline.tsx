import type { GeoPoint } from "@/domain";

type RoutePolylineProps = {
  points: GeoPoint[];
};

export function RoutePolyline({ points }: RoutePolylineProps) {
  if (points.length < 2) {
    return null;
  }

  return (
    <div className="rounded-md border border-dashed border-primary/45 bg-primary/10 p-3 text-xs text-muted-foreground">
      Route preview: {points.length} points connected by provider-normalized
      coordinates.
    </div>
  );
}
