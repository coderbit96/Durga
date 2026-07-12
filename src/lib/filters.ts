export type ZoneSlug = "north-kolkata" | "south-kolkata";

export type PujaFilterState = {
  accessible: boolean;
  categories: string[];
  famous: boolean;
  hiddenGem: boolean;
  nearMetro: boolean;
  page: number;
  search: string;
  sort: "popularity" | "name" | "recently-updated" | "nearest";
  view: "list" | "map";
};

export const defaultPujaFilters: PujaFilterState = {
  accessible: false,
  categories: [],
  famous: false,
  hiddenGem: false,
  nearMetro: false,
  page: 1,
  search: "",
  sort: "popularity",
  view: "list",
};

const categoryValues = new Set([
  "heritage",
  "theme",
  "traditional",
  "community",
  "family-friendly",
]);

function readBoolean(value: string | null) {
  return value === "true";
}

function readCategories(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => categoryValues.has(item));
}

export function parsePujaFilters(searchParams: URLSearchParams): PujaFilterState {
  const sort = searchParams.get("sort");
  const view = searchParams.get("view");
  const page = Number(searchParams.get("page") ?? "1");

  return {
    accessible: readBoolean(searchParams.get("accessible")),
    categories: readCategories(searchParams.get("categories")),
    famous: readBoolean(searchParams.get("famous")),
    hiddenGem: readBoolean(searchParams.get("hiddenGem")),
    nearMetro: readBoolean(searchParams.get("nearMetro")),
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
  if (filters.categories.length) {
    params.set("categories", filters.categories.join(","));
  }
  if (filters.famous) {
    params.set("famous", "true");
  }
  if (filters.hiddenGem) {
    params.set("hiddenGem", "true");
  }
  if (filters.nearMetro) {
    params.set("nearMetro", "true");
  }
  if (filters.accessible) {
    params.set("accessible", "true");
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

  if (filters.sort === "nearest" && options.latitude && options.longitude) {
    params.set("nearLat", String(options.latitude));
    params.set("nearLng", String(options.longitude));
    params.set("radiusKm", "25");
  } else if (filters.sort === "nearest") {
    params.delete("sort");
  }

  return params;
}
