"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import type { Puja } from "@/domain";
import { useFavoritesStore } from "@/stores/favorites";

export function FavoritesClient() {
  const ids = useFavoritesStore((state) => state.ids);
  const hydrated = useFavoritesStore((state) => state.hydrated);
  const remove = useFavoritesStore((state) => state.remove);
  const clear = useFavoritesStore((state) => state.clear);
  const [items, setItems] = useState<Puja[]>([]);
  const loading = hydrated && ids.length > 0 && items.length === 0;

  useEffect(() => {
    if (!hydrated || ids.length === 0) {
      return;
    }

    const controller = new AbortController();
    Promise.all(
      ids.map((slug) =>
        fetch(`/api/pujas/${slug}?includeUnverified=true`, {
          signal: controller.signal,
        }).then((response) => (response.ok ? response.json() : undefined)),
      ),
    )
      .then((results) => setItems(results.filter(Boolean) as Puja[]));

    return () => controller.abort();
  }, [hydrated, ids]);

  return (
    <Container className="space-y-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Heart aria-hidden="true" className="text-primary" size={28} />
          <h1 className="text-3xl font-semibold">Favorites</h1>
          <p className="text-muted-foreground">Saved pujas stay on this device.</p>
        </div>
        {ids.length ? (
          <Button onClick={clear} type="button" variant="outline">
            Clear
          </Button>
        ) : null}
      </div>

      {!hydrated || loading ? <Skeleton className="h-48" /> : null}
      {hydrated && !loading && items.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">No favorites yet.</p>
            <Button asChild>
              <Link href="/pujas/north-kolkata">Start exploring</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((puja) => (
          <Card key={puja.slug}>
            <CardHeader>
              <CardTitle>{puja.name.en}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{puja.locality}</p>
              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/puja/${puja.slug}`}>Open</Link>
                </Button>
                <Button onClick={() => remove(puja.slug)} type="button" variant="outline">
                  <Trash2 aria-hidden="true" size={16} />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
