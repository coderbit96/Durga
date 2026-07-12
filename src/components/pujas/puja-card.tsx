"use client";

import Link from "next/link";
import { Heart, Map, Navigation, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Puja } from "@/domain";
import { useFavoritesStore } from "@/stores/favorites";
import { usePlanStore } from "@/stores/plan";
import { useState } from "react";

type PujaCardProps = {
  distanceKm?: number;
  puja: Puja;
};

export function PujaCard({ distanceKm, puja }: PujaCardProps) {
  const [message, setMessage] = useState("");
  const addStop = usePlanStore((state) => state.addStop);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const [longitude, latitude] = puja.location.coordinates;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const favorite = favoriteIds.includes(puja.slug);

  return (
    <Card className="flex h-full flex-col transition duration-200 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_22px_54px_rgba(255,208,0,0.12)]">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {puja.tags.includes("famous") ? <Badge variant="festive">Famous</Badge> : null}
          {puja.tags.includes("hidden-gem") ? <Badge variant="teal">Hidden gem</Badge> : null}
          {!puja.verified ? <Badge>Pending verification</Badge> : null}
        </div>
        <CardTitle>{puja.name.en}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{puja.locality}</p>
          <p>{puja.themeDescription.en}</p>
          {typeof distanceKm === "number" ? (
            <p>{distanceKm.toFixed(1)} km away, approximate</p>
          ) : null}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              setMessage(addStop(puja.slug) ? "Added to plan." : "Already in plan or plan is full.");
            }}
            type="button"
            variant="outline"
          >
            <Plus aria-hidden="true" size={16} />
            Plan
          </Button>
          <Button
            onClick={() => {
              toggleFavorite(puja.slug);
              setMessage(favorite ? "Removed from favorites." : "Added to favorites.");
            }}
            type="button"
            variant="outline"
          >
            <Heart aria-hidden="true" size={16} />
            {favorite ? "Saved" : "Save"}
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/puja/${puja.slug}`}>
              <Map aria-hidden="true" size={16} />
              Details
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={mapsUrl} rel="noreferrer" target="_blank">
              <Navigation aria-hidden="true" size={16} />
              Go
            </a>
          </Button>
        </div>
        {message ? <p className="text-sm text-muted-foreground" role="status">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
