import type { GeoPoint } from "@/domain";

export type RouteStopPoint = {
  id: string;
  point: GeoPoint;
};

export function haversineDistance(a: GeoPoint, b: GeoPoint) {
  const [lngA, latA] = a.coordinates;
  const [lngB, latB] = b.coordinates;
  const radiusMeters = 6371000;
  const dLat = ((latB - latA) * Math.PI) / 180;
  const dLng = ((lngB - lngA) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((latA * Math.PI) / 180) *
      Math.cos((latB * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * radiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function calculateRouteDistance(origin: GeoPoint, stops: RouteStopPoint[]) {
  if (stops.length === 0) {
    return 0;
  }

  return stops.reduce((total, stop, index) => {
    const previous = index === 0 ? origin : stops[index - 1].point;
    return total + haversineDistance(previous, stop.point);
  }, 0);
}

// O(n^2). Uses straight-line distance as a fast local heuristic before asking
// the provider for practical road/transit estimates.
export function nearestNeighbourRoute(origin: GeoPoint, stops: RouteStopPoint[]) {
  const remaining = [...stops].sort((a, b) => a.id.localeCompare(b.id));
  const ordered: RouteStopPoint[] = [];
  let cursor = origin;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((stop, index) => {
      const distance = haversineDistance(cursor, stop.point);
      if (
        distance < bestDistance ||
        (distance === bestDistance &&
          stop.id.localeCompare(remaining[bestIndex].id) < 0)
      ) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    cursor = next.point;
  }

  return ordered;
}

function swapSegment(stops: RouteStopPoint[], start: number, end: number) {
  return [
    ...stops.slice(0, start),
    ...stops.slice(start, end + 1).reverse(),
    ...stops.slice(end + 1),
  ];
}

// O(k*n^3) in this bounded implementation. 2-opt improves local crossings but
// is still a heuristic; final provider route/matrix data should drive UI totals.
export function twoOptImproveRoute(
  origin: GeoPoint,
  stops: RouteStopPoint[],
  maxPasses = 20,
) {
  let best = [...stops];
  let bestDistance = calculateRouteDistance(origin, best);
  let improved = true;
  let pass = 0;

  while (improved && pass < maxPasses) {
    improved = false;
    pass += 1;

    for (let i = 0; i < best.length - 1; i += 1) {
      for (let j = i + 1; j < best.length; j += 1) {
        const candidate = swapSegment(best, i, j);
        const candidateDistance = calculateRouteDistance(origin, candidate);
        if (candidateDistance + 0.000001 < bestDistance) {
          best = candidate;
          bestDistance = candidateDistance;
          improved = true;
        }
      }
    }
  }

  return best;
}
