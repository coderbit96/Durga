import type { GeoPoint } from "@/domain";

type MarkerProps = {
  label: string;
  point: GeoPoint;
};

export function Marker({ label, point }: MarkerProps) {
  return (
    <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm">
      <span className="font-semibold">{label}</span>
      <span className="block text-muted-foreground">
        {point.coordinates[1].toFixed(4)}, {point.coordinates[0].toFixed(4)}
      </span>
    </div>
  );
}
