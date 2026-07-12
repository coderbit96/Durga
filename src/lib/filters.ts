export type ZoneSlug = "north-kolkata" | "south-kolkata";

export type PujaFilterState = {
  page: number;
  search: string;
  sort: "popularity" | "name" | "recently-updated" | "nearest";
  view: "list" | "map";
};

export const defaultPujaFilters: PujaFilterState = {
  page: 1,
  search: "",
  sort: "popularity",
  view: "list",
};

export function parsePujaFilters(searchParams: URLSearchParams): PujaFilterState {
  const sort = searchParams.get("sort");
  const view = searchParams.get("view");
  const page = Number(searchParams.get("page") ?? "1");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: searchParams.get("search") ?? "",
    sort:
      sort === "name" || sort === "recently-updated" || sort === "nearest"
        ? sort
        : "popularity",
    view: view === "map" ? "map" : "list",
  };
}

export function serializePujaFilters(filters: PujaFilterState) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sort !== "popularity") {
    params.set("sort", filters.sort);
  }
  if (filters.view !== "list") {
    params.set("view", filters.view);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params;
}

export function apiParamsFromFilters(
  filters: PujaFilterState,
  zone: ZoneSlug,
  options: { latitude?: number; longitude?: number } = {},
) {
  const params = serializePujaFilters(filters);
  params.set("zone", zone);
  params.set("limit", "9");
  params.set("includeUnverified", "true");

  if (
    filters.sort === "nearest" &&
    typeof options.latitude === "number" &&
    typeof options.longitude === "number"
  ) {
    params.set("nearLat", String(options.latitude));
    params.set("nearLng", String(options.longitude));
    params.set("radiusKm", "25");
  } else if (filters.sort === "nearest") {
    params.delete("sort");
  }

  return params;
}
