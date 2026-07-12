import type { GeoPoint } from "@/domain";

type MarkerProps = {
  label: string;
  point: GeoPoint;
};

export function Marker({ label, point }: MarkerProps) {
  return (
    <div className="rounded-md bg-white/10 p-3 text-sm">
      <span className="font-semibold">{label}</span>
      <span className="block text-[#dcefe6]">
        {point.coordinates[1].toFixed(4)}, {point.coordinates[0].toFixed(4)}
      </span>
    </div>
  );
}
