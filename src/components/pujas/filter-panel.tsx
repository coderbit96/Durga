"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PujaFilterState } from "@/lib/filters";

const categoryFilters = [
  { label: "Heritage", value: "heritage" },
  { label: "Theme", value: "theme" },
  { label: "Traditional", value: "traditional" },
  { label: "Community", value: "community" },
  { label: "Family-friendly", value: "family-friendly" },
];

type FilterPanelProps = {
  filters: PujaFilterState;
  mobileOpen?: boolean;
  onChange: (filters: PujaFilterState) => void;
  onClose?: () => void;
};

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function FilterPanel({
  filters,
  mobileOpen = false,
  onChange,
  onClose,
}: FilterPanelProps) {
  const panel = (
    <div className="space-y-5 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Filters</h2>
        {onClose ? (
          <Button aria-label="Close filters" onClick={onClose} type="button" variant="ghost">
            <X aria-hidden="true" size={18} />
          </Button>
        ) : null}
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Puja type</legend>
        <div className="grid gap-2">
          {categoryFilters.map((filter) => (
            <label className="flex items-center gap-2 text-sm" key={filter.value}>
              <input
                checked={filters.categories.includes(filter.value)}
                onChange={() =>
                  onChange({
                    ...filters,
                    categories: toggleValue(filters.categories, filter.value),
                    page: 1,
                  })
                }
                type="checkbox"
              />
              {filter.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Highlights</legend>
        <div className="grid gap-2">
          {[
            ["famous", "Famous"],
            ["hiddenGem", "Hidden gem"],
            ["nearMetro", "Near metro"],
            ["accessible", "Wheelchair accessible"],
          ].map(([key, label]) => (
            <label className="flex items-center gap-2 text-sm" key={key}>
              <input
                checked={Boolean(filters[key as keyof PujaFilterState])}
                onChange={() =>
                  onChange({
                    ...filters,
                    [key]: !filters[key as keyof PujaFilterState],
                    page: 1,
                  })
                }
                type="checkbox"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <Button
        className="w-full"
        onClick={() =>
          onChange({
            accessible: false,
            categories: [],
            famous: false,
            hiddenGem: false,
            nearMetro: false,
            page: 1,
            search: "",
            sort: "popularity",
            view: "list",
          })
        }
        type="button"
        variant="outline"
      >
        Clear filters
      </Button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{panel}</aside>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/35 p-4 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="ml-auto max-w-sm">{panel}</div>
      </div>
    </>
  );
}
