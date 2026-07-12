import type { DistanceMatrixInput, DistanceMatrixResult, GeoPoint, RouteResult, TravelMode } from "@/domain";

export type MapProviderId = "mock" | "osm";

export type GeocodeResult = {
  address: string;
  location: GeoPoint;
  provider: MapProviderId;
};

export type ReverseGeocodeResult = {
  address: string;
  locality?: string;
  provider: MapProviderId;
};

export type MapRouteInput = {
  mode: TravelMode;
  origin: GeoPoint;
  stops: GeoPoint[];
};

export type NavigationInput = {
  destination: GeoPoint;
  origin?: GeoPoint;
  travelMode?: TravelMode;
};

export type MapProvider = {
  distanceMatrix(input: DistanceMatrixInput): Promise<DistanceMatrixResult>;
  externalNavigationUrl(input: NavigationInput): string;
  geocode(query: string): Promise<GeocodeResult[]>;
  id: MapProviderId;
  reverseGeocode(point: GeoPoint): Promise<ReverseGeocodeResult>;
  route(input: MapRouteInput): Promise<RouteResult>;
};
