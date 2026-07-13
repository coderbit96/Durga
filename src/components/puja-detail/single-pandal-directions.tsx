"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationStatus } from "@/components/location/location-status";
import { ManualStartLocation } from "@/components/location/manual-start-location";
import { MapView } from "@/components/maps/map-view";
import type { AppTravelMode, GeoPoint, RouteResult } from "@/domain";
import { useCurrentLocation } from "@/lib/location/use-current-location";

type RouteResponse = {
  error?: { code: string; message: string };
  externalNavigationUrl: string;
  fallback: boolean;
  provider: string;
  route?: RouteResult;
};

type SinglePandalDirectionsProps = {
  destination: GeoPoint;
  destinationName: string;
};

function pointFromLocation(latitude: number, longitude: number): GeoPoint {
  return { coordinates: [longitude, latitude], type: "Point" };
}

export function SinglePandalDirections({
  destination,
  destinationName,
}: SinglePandalDirectionsProps) {
  const { requestLocation, setManualLocation, state } = useCurrentLocation();
  const [mode, setMode] = useState<AppTravelMode>("walking");
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculateRoute() {
    if (!state.location) {
      setError("Choose a browser or manual start location first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/route", {
        body: JSON.stringify({
          destination,
          mode,
          origin: pointFromLocation(
            state.location.latitude,
            state.location.longitude,
          ),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json()) as RouteResponse;
      setResult(body);
      if (!response.ok && !body.externalNavigationUrl) {
        setError(body.error?.message ?? "Unable to calculate route.");
      }
    } catch {
      setError("Unable to calculate route. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const origin = state.location
    ? pointFromLocation(state.location.latitude, state.location.longitude)
    : undefined;
  const route = result?.route;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Directions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1 text-sm font-medium">
            Travel mode
            <select
              className="min-h-11 rounded-md border border-border bg-surface px-3"
              onChange={(event) => setMode(event.target.value as AppTravelMode)}
              value={mode}
            >
              <option value="walking">Walking</option>
              <option value="driving">Driving</option>
              <option value="transit">Transit</option>
            </select>
          </label>
          <Button disabled={loading} onClick={calculateRoute} type="button">
            {loading ? "Calculating..." : "Get directions"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => requestLocation({ enableHighAccuracy: false, timeoutMs: 10000 })}
            type="button"
            variant="outline"
          >
            Use current location
          </Button>
        </div>
        <LocationStatus state={state} />
        <ManualStartLocation onSubmit={setManualLocation} />

        {error ? (
          <div className="rounded-md border border-primary/25 bg-primary/10 p-3 text-sm">
            {error}
            <Button className="ml-2" onClick={calculateRoute} type="button" variant="ghost">
              <RefreshCw aria-hidden="true" size={16} />
              Retry
            </Button>
          </div>
        ) : null}

        {route ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-surface-muted p-3 text-sm">
              <p className="font-medium">Distance</p>
              <p>{(route.totalDistanceMeters / 1000).toFixed(1)} km</p>
            </div>
            <div className="rounded-md bg-surface-muted p-3 text-sm">
              <p className="font-medium">Estimated duration</p>
              <p>{route.totalDurationMinutes} min</p>
            </div>
          </div>
        ) : null}

        {origin ? (
          <MapView
            markers={[
              { id: "origin", label: "Start", point: origin },
              { id: "destination", label: destinationName, point: destination },
            ]}
            routePoints={[origin, destination]}
          />
        ) : null}

        {route?.legs.length ? (
          <ol className="space-y-2">
            {route.legs.map((leg, index) => (
              <li className="rounded-md border border-border p-3 text-sm" key={index}>
                <p className="font-medium">Step {index + 1}</p>
                <p className="text-muted-foreground">
                  {(leg.distanceMeters / 1000).toFixed(1)} km - {leg.durationMinutes} min
                </p>
                {leg.instructions.map((instruction) => (
                  <p className="text-muted-foreground" key={instruction}>
                    {instruction}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        ) : null}

        {result?.externalNavigationUrl ? (
          <Button asChild className="w-full" variant="secondary">
            <a href={result.externalNavigationUrl} rel="noreferrer" target="_blank">
              Open in Maps
            </a>
          </Button>
        ) : null}
        {result?.fallback ? (
          <p className="text-sm text-muted-foreground">
            In-app routing is unavailable, but the external navigation link is ready.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
