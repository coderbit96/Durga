import type { MapProvider } from "./types";
import { mockMapProvider } from "./mock-provider";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export const osmMapProvider: MapProvider = {
  async distanceMatrix(input) {
    return mockMapProvider.distanceMatrix(input);
  },
  externalNavigationUrl(input) {
    return mockMapProvider.externalNavigationUrl(input);
  },
  async geocode(query) {
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "5",
      q: query,
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": "PujoPath Kolkata development app" },
    });

    if (!response.ok) {
      throw new Error("OpenStreetMap geocoding failed.");
    }

    const results = (await response.json()) as NominatimResult[];
    return results.map((result) => ({
      address: result.display_name,
      location: {
        coordinates: [Number(result.lon), Number(result.lat)],
        type: "Point",
      },
      provider: "osm",
    }));
  },
  id: "osm",
  async reverseGeocode(point) {
    const [longitude, latitude] = point.coordinates;
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { "User-Agent": "PujoPath Kolkata development app" },
    });

    if (!response.ok) {
      throw new Error("OpenStreetMap reverse geocoding failed.");
    }

    const result = (await response.json()) as { display_name?: string };
    return {
      address: result.display_name ?? `${latitude}, ${longitude}`,
      provider: "osm",
    };
  },
  async route(input) {
    return mockMapProvider.route(input);
  },
};
