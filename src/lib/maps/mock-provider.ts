import type { GeoPoint } from "@/domain";
import type { MapProvider, MapRouteInput, NavigationInput } from "./types";

function haversineMeters(a: GeoPoint, b: GeoPoint) {
  const [lngA, latA] = a.coordinates;
  const [lngB, latB] = b.coordinates;
  const radius = 6371000;
  const dLat = ((latB - latA) * Math.PI) / 180;
  const dLng = ((lngB - lngA) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((latA * Math.PI) / 180) *
      Math.cos((latB * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return Math.round(2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export const mockMapProvider: MapProvider = {
  async distanceMatrix(input) {
    return {
      cells: input.origins.map((origin) =>
        input.destinations.map((destination) => {
          const distanceMeters = haversineMeters(origin, destination);
          return {
            distanceMeters,
            durationMinutes: Math.max(1, Math.round(distanceMeters / 70)),
            status: "ok",
          };
        }),
      ),
      generatedAt: new Date().toISOString(),
      provider: "mock",
    };
  },
  externalNavigationUrl(input: NavigationInput) {
    const [destinationLng, destinationLat] = input.destination.coordinates;
    const destination = `${destinationLat},${destinationLng}`;

    if (input.origin) {
      const [originLng, originLat] = input.origin.coordinates;
      return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destination}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  },
  async geocode(query) {
    return [
      {
        address: query,
        location: { coordinates: [88.3639, 22.5726], type: "Point" },
        provider: "mock",
      },
    ];
  },
  id: "mock",
  async reverseGeocode(point) {
    return {
      address: `${point.coordinates[1].toFixed(5)}, ${point.coordinates[0].toFixed(5)}`,
      locality: "Kolkata",
      provider: "mock",
    };
  },
  async route(input: MapRouteInput) {
    const points = [input.origin, ...input.stops];
    const legs = points.slice(0, -1).map((point, index) => {
      const distanceMeters = haversineMeters(point, points[index + 1]);
      return {
        distanceMeters,
        durationMinutes: Math.max(1, Math.round(distanceMeters / 70)),
        fromStopSequence: index + 1,
        instructions: ["Mock route segment for development."],
        mode: input.mode,
        toStopSequence: index + 2,
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      input: {
        avoidCrowds: false,
        maxStops: input.stops.length,
        preferredModes: [input.mode],
        startAt: input.origin,
        stops: input.stops.map((stop, index) => ({
          dwellMinutes: 20,
          location: stop,
          pujaSlug: `stop-${index + 1}`,
          sequence: index + 1,
        })),
        year: new Date().getFullYear(),
      },
      legs,
      totalDistanceMeters: legs.reduce((sum, leg) => sum + leg.distanceMeters, 0),
      totalDurationMinutes: legs.reduce((sum, leg) => sum + leg.durationMinutes, 0),
    };
  },
};
