"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { LocationStatus } from "@/components/location/location-status";
import { ManualStartLocation } from "@/components/location/manual-start-location";
import { MapView } from "@/components/maps/map-view";
import type { AppTravelMode, GeoPoint, Puja, RouteResult } from "@/domain";
import { useCurrentLocation } from "@/lib/location/use-current-location";
import {
  nearestNeighbourRoute,
  twoOptImproveRoute,
  type RouteStopPoint,
} from "@/lib/routing/algorithms";
import { maxPlanStops, usePlanStore } from "@/stores/plan";

type RouteResponse = {
  externalNavigationUrl: string;
  fallback: boolean;
  route?: RouteResult;
};

function pointFromLocation(latitude: number, longitude: number): GeoPoint {
  return { coordinates: [longitude, latitude], type: "Point" };
}

function SortableStop({
  onRemove,
  puja,
  sequence,
}: {
  onRemove: () => void;
  puja: Puja;
  sequence: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: puja.slug,
  });

  return (
    <li
      className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        aria-label={`Move stop ${sequence}: ${puja.name.en}`}
        className="text-muted-foreground"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" size={18} />
      </button>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm text-primary-foreground">
        {sequence}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{puja.name.en}</p>
        <p className="text-sm text-muted-foreground">{puja.locality}</p>
      </div>
      <Button aria-label={`Remove ${puja.name.en}`} onClick={onRemove} type="button" variant="ghost">
        <Trash2 aria-hidden="true" size={16} />
      </Button>
    </li>
  );
}

export function PlanClient() {
  const stops = usePlanStore((state) => state.stops);
  const hydrated = usePlanStore((state) => state.hydrated);
  const travelMode = usePlanStore((state) => state.travelMode);
  const startLocation = usePlanStore((state) => state.startLocation);
  const manualOrder = usePlanStore((state) => state.manualOrder);
  const optimized = usePlanStore((state) => state.optimized);
  const removeStop = usePlanStore((state) => state.removeStop);
  const reorderStops = usePlanStore((state) => state.reorderStops);
  const clear = usePlanStore((state) => state.clear);
  const setTravelMode = usePlanStore((state) => state.setTravelMode);
  const setStartLocation = usePlanStore((state) => state.setStartLocation);
  const setOptimizedOrder = usePlanStore((state) => state.setOptimizedOrder);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const location = useCurrentLocation();
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state.location) {
      setStartLocation(location.state.location);
    }
  }, [location.state.location, setStartLocation]);

  useEffect(() => {
    if (!hydrated || stops.length === 0) {
      return;
    }

    const controller = new AbortController();
    Promise.all(
      stops.map((slug) =>
        fetch(`/api/pujas/${slug}?includeUnverified=true`, {
          signal: controller.signal,
        }).then((response) => (response.ok ? response.json() : undefined)),
      ),
    ).then((results) => setPujas(results.filter(Boolean) as Puja[]));

    return () => controller.abort();
  }, [hydrated, stops]);

  const orderedPujas = useMemo(
    () => stops.map((slug) => pujas.find((puja) => puja.slug === slug)).filter(Boolean) as Puja[],
    [pujas, stops],
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) {
      return;
    }
    const oldIndex = stops.indexOf(String(event.active.id));
    const newIndex = stops.indexOf(String(event.over.id));
    reorderStops(arrayMove(stops, oldIndex, newIndex));
  }

  async function calculateProviderRoute(nextStops = orderedPujas) {
    const originLocation = startLocation ?? location.state.location;
    if (!originLocation || nextStops.length === 0) {
      setMessage("Choose a start location and at least one stop.");
      return;
    }

    setLoadingRoute(true);
    setMessage("");
    const destination = nextStops[nextStops.length - 1].location;
    const waypoints = nextStops.slice(0, -1).map((puja) => puja.location);
    const response = await fetch("/api/route", {
      body: JSON.stringify({
        destination,
        mode: travelMode,
        origin: pointFromLocation(originLocation.latitude, originLocation.longitude),
        waypoints,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const body = (await response.json()) as RouteResponse;
    setRouteResult(body);
    setLoadingRoute(false);
    if (!response.ok && body.externalNavigationUrl) {
      setMessage("In-app routing failed; external Maps link is available.");
    }
  }

  async function optimize() {
    const originLocation = startLocation ?? location.state.location;
    if (!originLocation) {
      setMessage("Choose a start location before optimizing.");
      return;
    }
    const origin = pointFromLocation(originLocation.latitude, originLocation.longitude);
    const points: RouteStopPoint[] = orderedPujas.map((puja) => ({
      id: puja.slug,
      point: puja.location,
    }));
    const nearest = nearestNeighbourRoute(origin, points);
    const improved = twoOptImproveRoute(origin, nearest);
    const nextSlugs = improved.map((stop) => stop.id);
    setOptimizedOrder(nextSlugs);
    await calculateProviderRoute(
      nextSlugs.map((slug) => orderedPujas.find((puja) => puja.slug === slug)!).filter(Boolean),
    );
  }

  async function sharePlan() {
    const orderedNames = orderedPujas.map((puja, index) => `${index + 1}. ${puja.name.en}`);
    const shareText = `PujoPath route: ${orderedNames.join(" -> ")}`;

    if (navigator.share) {
      await navigator.share({ text: shareText, title: "My Puja Plan" });
      return;
    }

    setSharing(true);
    const response = await fetch("/api/shared-plans", {
      body: JSON.stringify({
        includeOrigin: false,
        routeInput: {
          avoidCrowds: false,
          maxStops: maxPlanStops,
          preferredModes: [travelMode],
          stops: stops.map((slug, index) => ({
            dwellMinutes: 20,
            pujaSlug: slug,
            sequence: index + 1,
          })),
          year: new Date().getFullYear(),
        },
        title: "My Puja Plan",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const body = (await response.json()) as { shareCode?: string };
    setSharing(false);

    if (body.shareCode) {
      const url = `${window.location.origin}/share/${body.shareCode}`;
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setMessage("Shared route link copied. Origin was not included.");
    } else {
      await navigator.clipboard.writeText(shareText);
      setMessage("Route text copied.");
    }
  }

  if (!hydrated) {
    return <Container className="py-10">Loading plan...</Container>;
  }

  if (stops.length === 0) {
    return (
      <Container className="py-10">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4 p-6">
            <Badge variant="festive">Plan</Badge>
            <h1 className="text-3xl font-semibold">Your plan is empty.</h1>
            <p className="text-muted-foreground">
              Add pujas from the listing pages to build a route.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/pujas/north-kolkata">North Kolkata</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/pujas/south-kolkata">South Kolkata</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const originPoint =
    startLocation || location.state.location
      ? pointFromLocation(
          (startLocation ?? location.state.location)!.latitude,
          (startLocation ?? location.state.location)!.longitude,
        )
      : undefined;
  const mapPoints = [
    ...(originPoint ? [{ id: "origin", label: "Start", point: originPoint }] : []),
    ...orderedPujas.map((puja, index) => ({
      id: puja.slug,
      label: `${index + 1}. ${puja.name.en}`,
      point: puja.location,
    })),
  ];

  return (
    <Container className="grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5">
        <div className="space-y-2">
          <Badge variant="festive">Plan</Badge>
          <h1 className="text-3xl font-semibold">My Puja Plan</h1>
          <p className="text-muted-foreground">
            {stops.length}/{maxPlanStops} stops selected. Estimates are planning
            aids; festival traffic and barricades can change quickly.
          </p>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={stops} strategy={verticalListSortingStrategy}>
            <ol className="space-y-3">
              {orderedPujas.map((puja, index) => (
                <SortableStop
                  key={puja.slug}
                  onRemove={() => removeStop(puja.slug)}
                  puja={puja}
                  sequence={index + 1}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>

        <MapView
          markers={mapPoints}
          routePoints={mapPoints.map((item) => item.point)}
        />
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Route settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="grid gap-1 text-sm font-medium">
              Travel mode
              <select
                className="min-h-11 rounded-md border border-border bg-surface px-3"
                onChange={(event) => setTravelMode(event.target.value as AppTravelMode)}
                value={travelMode}
              >
                <option value="walking">Walking</option>
                <option value="driving">Driving</option>
                <option value="transit">Transit</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => location.requestLocation({ timeoutMs: 10000 })}
                type="button"
                variant="outline"
              >
                Use current location
              </Button>
              {process.env.NODE_ENV !== "production" ? (
                <Button onClick={location.useMockLocation} type="button" variant="outline">
                  Use dev mock
                </Button>
              ) : null}
            </div>
            <LocationStatus state={location.state} />
            <ManualStartLocation
              onSubmit={(manual) => {
                location.setManualLocation(manual);
                setStartLocation({ ...manual, source: "manual" });
              }}
            />
            <Button
              className="w-full"
              disabled={loadingRoute}
              onClick={optimize}
              type="button"
            >
              {loadingRoute ? "Optimizing..." : "Optimize route"}
            </Button>
            <Button
              className="w-full"
              disabled={loadingRoute}
              onClick={() => calculateProviderRoute()}
              type="button"
              variant="outline"
            >
              Estimate manual order
            </Button>
            {optimized && manualOrder ? (
              <Button
                className="w-full"
                onClick={() => reorderStops(manualOrder)}
                type="button"
                variant="ghost"
              >
                Restore manual order
              </Button>
            ) : null}
            <Button className="w-full" onClick={clear} type="button" variant="outline">
              Clear plan
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {routeResult?.route ? (
              <>
                <p>Total distance: {(routeResult.route.totalDistanceMeters / 1000).toFixed(1)} km</p>
                <p>Estimated duration: {routeResult.route.totalDurationMinutes} min</p>
                {routeResult.route.legs.map((leg, index) => (
                  <p key={index}>
                    Stop {index + 1}: {(leg.distanceMeters / 1000).toFixed(1)} km -{" "}
                    {leg.durationMinutes} min
                  </p>
                ))}
              </>
            ) : (
              <p>Run an estimate to see distance and time.</p>
            )}
            {routeResult?.externalNavigationUrl ? (
              <Button asChild className="w-full" variant="secondary">
                <a href={routeResult.externalNavigationUrl} rel="noreferrer" target="_blank">
                  Open route in maps
                </a>
              </Button>
            ) : null}
            <Button
              className="w-full"
              disabled={sharing}
              onClick={sharePlan}
              type="button"
              variant="outline"
            >
              {sharing ? "Sharing..." : "Share plan"}
            </Button>
            <p>
              Provider waypoint limits may apply. If a provider rejects a route,
              keep fewer stops or open the external Maps link.
            </p>
          </CardContent>
        </Card>
      </aside>
    </Container>
  );
}

