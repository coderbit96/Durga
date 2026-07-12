import type { GeoPoint } from "@/domain";

type RoutePolylineProps = {
  points: GeoPoint[];
};

export function RoutePolyline({ points }: RoutePolylineProps) {
  if (points.length < 2) {
    return null;
  }

  return (
    <div className="rounded-md border border-dashed border-white/35 p-3 text-xs text-[#dcefe6]">
      Route preview: {points.length} points connected by provider-normalized
      coordinates.
    </div>
  );
}
