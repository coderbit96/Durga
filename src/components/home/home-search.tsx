"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Puja } from "@/domain";

type PujaListResponse = {
  items: Puja[];
};

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          limit: "5",
          search: query,
        });
        const response = await fetch(`/api/pujas?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search is temporarily unavailable.");
        }

        const data = (await response.json()) as PujaListResponse;
        setItems(data.items);
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setItems([]);
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Search is temporarily unavailable.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="relative max-w-xl">
      <label className="sr-only" htmlFor="home-puja-search">
        Search Puja by name
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          className="pl-10"
          id="home-puja-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Bagbazar, Deshapriya, Ekdalia..."
          value={query}
        />
      </div>
      {query.trim().length >= 2 ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {loading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : null}
          {!loading && error ? (
            <p className="p-3 text-sm text-muted-foreground">{error}</p>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No matching pujas found.</p>
          ) : null}
          {!loading && !error && items.length > 0 ? (
            <ul>
              {items.map((puja) => (
                <li key={`${puja.slug}-${puja.year}`}>
                  <Link
                    className="block px-4 py-3 text-sm transition hover:bg-surface-muted"
                    href={`/puja/${puja.slug}`}
                  >
                    <span className="font-medium">{puja.name.en}</span>
                    <span className="block text-muted-foreground">
                      {puja.locality}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
