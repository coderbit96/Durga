"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, LocateFixed, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/maps/map-view";
import { Skeleton } from "@/components/ui/skeleton";
import type { Puja } from "@/domain";
import {
  apiParamsFromFilters,
  parsePujaFilters,
  serializePujaFilters,
  type PujaFilterState,
  type ZoneSlug,
} from "@/lib/filters";
import { PujaCard } from "./puja-card";
import { SortSelect } from "./sort-select";
import { ZoneHeader } from "./zone-header";

type PujaListResponse = {
  items: Puja[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ZoneListingProps = {
  description: string;
  title: string;
  zone: ZoneSlug;
};

function distanceKm(from: Coordinates, puja: Puja) {
  const [longitude, latitude] = puja.location.coordinates;
  const earthRadiusKm = 6371;
  const dLat = ((latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ListingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  );
}

function DebouncedSearchInput({
  initialValue,
  onCommit,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = window.setTimeout(() => onCommit(value), 350);
    return () => window.clearTimeout(timer);
  }, [onCommit, value]);

  return (
    <Input
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search this zone"
      value={value}
    />
  );
}

export function ZoneListing({ description, title, zone }: ZoneListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parsePujaFilters(searchParams), [searchParams]);
  const [items, setItems] = useState<Puja[]>([]);
  const [meta, setMeta] = useState<PujaListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  const commitFilters = useCallback((next: PujaFilterState) => {
    const params = serializePujaFilters(next);
    router.replace(params.size ? `${pathname}?${params}` : pathname, {
      scroll: false,
    });
  }, [pathname, router]);

  function requestLocation(nextSort?: PujaFilterState["sort"]) {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    setLocationMessage("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(nextCoordinates);
        setLocationMessage("Location enabled for approximate distances.");
        if (nextSort) {
          commitFilters({ ...filters, page: 1, sort: nextSort });
        }
      },
      () => setLocationMessage("Location permission was not granted."),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
    );
  }

  useEffect(() => {
    const controller = new AbortController();
    const params = apiParamsFromFilters(filters, zone, coordinates ?? undefined);

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/pujas?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Puja listings are temporarily unavailable.");
        }
        const data = (await response.json()) as PujaListResponse;
        setItems((current) =>
          filters.page > 1 ? [...current, ...data.items] : data.items,
        );
        setMeta(data.meta);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setItems([]);
          setMeta(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Puja listings are temporarily unavailable.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [coordinates, filters, zone]);

  return (
    <Container className="space-y-6 py-10">
      <ZoneHeader description={description} title={title} />
      <div className="grid gap-6">
        <section className="space-y-5">
          <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <label className="grid gap-1 text-sm font-medium">
              Search
              <DebouncedSearchInput
                initialValue={filters.search}
                key={filters.search}
                onCommit={(search) => {
                  if (search !== filters.search) {
                    commitFilters({ ...filters, page: 1, search });
                  }
                }}
              />
            </label>
            <SortSelect
              onChange={(sort) => {
                if (sort === "nearest" && !coordinates) {
                  requestLocation(sort);
                  return;
                }
                commitFilters({ ...filters, page: 1, sort });
              }}
              value={filters.sort}
            />
            <div className="flex gap-2">
              <Button
                aria-label="List view"
                onClick={() => commitFilters({ ...filters, view: "list" })}
                type="button"
                variant={filters.view === "list" ? "secondary" : "outline"}
              >
                <LayoutGrid aria-hidden="true" size={18} />
              </Button>
              <Button
                aria-label="Map view"
                onClick={() => commitFilters({ ...filters, view: "map" })}
                type="button"
                variant={filters.view === "map" ? "secondary" : "outline"}
              >
                <MapPinned aria-hidden="true" size={18} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              {meta ? `${meta.total} pujas found` : "Loading pujas"}
              {locationMessage ? ` - ${locationMessage}` : ""}
            </p>
            <Button onClick={() => requestLocation()} type="button" variant="outline">
              <LocateFixed aria-hidden="true" size={18} />
              Use current location
            </Button>
          </div>

          {filters.sort === "nearest" && !coordinates ? (
            <Card className="p-4 text-sm text-muted-foreground">
              Nearest sorting is selected. Use current location to calculate
              approximate distances and sort nearby pujas.
            </Card>
          ) : null}

          {loading && filters.page === 1 ? <ListingSkeleton /> : null}
          {!loading && error ? (
            <Card className="p-5 text-sm text-muted-foreground">{error}</Card>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">
              No pujas match this search.
            </Card>
          ) : null}

          {!error && items.length > 0 && filters.view === "list" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((puja) => (
                <PujaCard
                  distanceKm={coordinates ? distanceKm(coordinates, puja) : undefined}
                  key={`${puja.slug}-${puja.year}`}
                  puja={puja}
                />
              ))}
            </div>
          ) : null}

          {!error && items.length > 0 && filters.view === "map" ? (
            <MapView
              markers={items.map((puja, index) => ({
                id: puja.slug,
                label: `${index + 1}. ${puja.name.en}`,
                point: puja.location,
              }))}
              routePoints={items.map((puja) => puja.location)}
            />
          ) : null}

          {meta && meta.page < meta.totalPages ? (
            <div className="flex justify-center">
              <Button
                disabled={loading}
                onClick={() => commitFilters({ ...filters, page: filters.page + 1 })}
                type="button"
                variant="outline"
              >
                {loading ? "Loading..." : "Load more"}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </Container>
  );
}
