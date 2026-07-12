import { env } from "@/lib/env";
import { mockMapProvider } from "./mock-provider";
import { osmMapProvider } from "./osm-provider";
import type { MapProvider } from "./types";

export function getMapProvider(): MapProvider {
  if (env.MAP_PROVIDER === "osm") {
    return osmMapProvider;
  }

  return mockMapProvider;
}

export function getExternalNavigationUrl(
  ...args: Parameters<MapProvider["externalNavigationUrl"]>
) {
  return getMapProvider().externalNavigationUrl(...args);
}
