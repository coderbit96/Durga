import {
  apiListQuerySchema,
  apiDetailQuerySchema,
  apiRouteDetailQuerySchema,
  apiRoutesListQuerySchema,
  pujaSeedRecordSchema,
  suggestedRouteSeedRecordSchema,
  type ApiListQuery,
  type Puja,
  type SuggestedRoute,
} from "../../domain";
import samplePujas from "../../../data/pujas-2026.json";
import sampleRoutes from "../../../data/routes-2026.json";
import { connectToDatabase } from "../db/mongoose";
import { PujaModel, type PujaDocument } from "../models/puja";
import {
  SuggestedRouteModel,
  type SuggestedRouteDocument,
} from "../models/suggested-route";

export type PublicPujaListQuery = ApiListQuery;
type MongoFilter = Record<string, unknown>;
type MongoSort = Record<string, 1 | -1 | { $meta: "textScore" }>;

type LeanPuja = Omit<PujaDocument, "createdAt" | "lastVerifiedAt" | "updatedAt"> & {
  _id?: unknown;
  __v?: unknown;
  createdAt: Date | string;
  lastVerifiedAt: Date | string;
  updatedAt: Date | string;
};

type LeanRoute = Omit<SuggestedRouteDocument, "createdAt" | "updatedAt"> & {
  _id?: unknown;
  __v?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const sampleTimestamp = "2026-01-01T00:00:00.000+05:30";

function samplePujaRecords() {
  return samplePujas
    .map((record) => pujaSeedRecordSchema.parse(record))
    .map((record) => ({
      ...record,
      createdAt: sampleTimestamp,
      updatedAt: sampleTimestamp,
    }));
}

function sampleRouteRecords() {
  return sampleRoutes
    .map((record) => suggestedRouteSeedRecordSchema.parse(record))
    .map((record) => ({
      ...record,
      createdAt: sampleTimestamp,
      updatedAt: sampleTimestamp,
    }));
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

export function normalizePuja(doc: LeanPuja): Puja {
  const { _id, __v, ...record } = doc;
  void _id;
  void __v;

  return {
    ...record,
    createdAt: toIso(record.createdAt),
    lastVerifiedAt: toIso(record.lastVerifiedAt),
    updatedAt: toIso(record.updatedAt),
  };
}

export function normalizeRoute(doc: LeanRoute): SuggestedRoute {
  const { _id, __v, ...record } = doc;
  void _id;
  void __v;

  return {
    ...record,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  };
}

function allowsUnverified(query: PublicPujaListQuery) {
  return query.includeUnverified && process.env.NODE_ENV !== "production";
}

function buildPujaFilters(query: PublicPujaListQuery) {
  const baseFilter: MongoFilter = {};

  if (query.zone) {
    baseFilter.zone = query.zone;
  }
  if (query.year) {
    baseFilter.year = query.year;
  }
  if (query.category) {
    baseFilter.categories = query.category;
  }
  if (query.categories?.length) {
    baseFilter.categories = { $all: query.categories };
  }
  if (query.tag) {
    baseFilter.tags = query.tag;
  }
  if (query.tags?.length) {
    baseFilter.tags = { $all: query.tags };
  }
  if (query.famous) {
    baseFilter.tags = { $all: [...(query.tags ?? []), "famous"] };
  }
  if (query.hiddenGem) {
    baseFilter.tags = { $all: [...(query.tags ?? []), "hidden-gem"] };
  }
  if (query.nearMetro) {
    baseFilter.nearestMetro = { $exists: true, $ne: "" };
  }
  if (query.accessible) {
    baseFilter["accessibility.wheelchairAccess"] = true;
  }
  if (typeof query.featured === "boolean") {
    baseFilter.featured = query.featured;
  }
  if (typeof query.verified === "boolean") {
    baseFilter.verified = query.verified;
  } else if (!allowsUnverified(query)) {
    baseFilter.verified = true;
  }

  const search = query.search || query.q;
  if (search) {
    baseFilter.$text = { $search: search };
  }

  const findFilter: MongoFilter = { ...baseFilter };
  const countFilter: MongoFilter = { ...baseFilter };
  const hasCoordinates =
    typeof query.nearLat === "number" && typeof query.nearLng === "number";

  if (hasCoordinates && (query.sort === "nearest" || query.radiusKm)) {
    const maxDistance = (query.radiusKm ?? 25) * 1000;
    findFilter.location = {
      $near: {
        $geometry: {
          coordinates: [query.nearLng, query.nearLat],
          type: "Point",
        },
        $maxDistance: maxDistance,
      },
    };
    countFilter.location = {
      $geoWithin: {
        $centerSphere: [[query.nearLng, query.nearLat], maxDistance / 6378100],
      },
    };
  }

  return { countFilter, findFilter };
}

function buildPujaSort(query: PublicPujaListQuery) {
  if (query.sort === "nearest") {
    return undefined;
  }

  const sort: MongoSort = {};

  if (query.search || query.q) {
    sort.score = { $meta: "textScore" };
  }

  if (query.sort === "name") {
    sort["name.en"] = 1;
  } else if (query.sort === "recently-updated") {
    sort.updatedAt = -1;
  } else {
    sort.popularityScore = -1;
  }

  sort.slug = 1;
  return sort;
}

function listSamplePujas(query: PublicPujaListQuery) {
  const search = (query.search || query.q || "").toLowerCase();
  const hasCoordinates =
    typeof query.nearLat === "number" && typeof query.nearLng === "number";

  let items = samplePujaRecords().filter((puja) => {
    if (!allowsUnverified(query) && !puja.verified) {
      return false;
    }
    if (query.zone && puja.zone !== query.zone) {
      return false;
    }
    if (query.year && puja.year !== query.year) {
      return false;
    }
    if (query.category && !puja.categories.includes(query.category)) {
      return false;
    }
    if (query.categories?.some((category) => !puja.categories.includes(category))) {
      return false;
    }
    if (query.tag && !puja.tags.includes(query.tag)) {
      return false;
    }
    if (query.tags?.some((tag) => !puja.tags.includes(tag))) {
      return false;
    }
    if (query.famous && !puja.tags.includes("famous")) {
      return false;
    }
    if (query.hiddenGem && !puja.tags.includes("hidden-gem")) {
      return false;
    }
    if (query.nearMetro && !puja.nearestMetro) {
      return false;
    }
    if (query.accessible && !puja.accessibility.wheelchairAccess) {
      return false;
    }
    if (typeof query.featured === "boolean" && puja.featured !== query.featured) {
      return false;
    }
    if (search) {
      const haystack = [
        puja.name.en,
        puja.name.bn,
        puja.locality,
        puja.themeTitle.en,
        puja.themeDescription.en,
        puja.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    }

    return true;
  });

  if (query.sort === "name") {
    items = items.sort((a, b) => a.name.en.localeCompare(b.name.en));
  } else if (query.sort === "recently-updated") {
    items = items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } else if (query.sort === "nearest" && hasCoordinates) {
    items = items.sort((a, b) => {
      const aDistance =
        (a.location.coordinates[0] - query.nearLng!) ** 2 +
        (a.location.coordinates[1] - query.nearLat!) ** 2;
      const bDistance =
        (b.location.coordinates[0] - query.nearLng!) ** 2 +
        (b.location.coordinates[1] - query.nearLat!) ** 2;
      return aDistance - bDistance;
    });
  } else {
    items = items.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  const total = items.length;
  const start = (query.page - 1) * query.limit;
  const paged = items.slice(start, start + query.limit);

  return {
    items: paged,
    meta: {
      limit: query.limit,
      page: query.page,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

function shouldFallback(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return (
    process.env.NODE_ENV !== "production" &&
    [
      "MongoDB connection failed",
      "before initial connection is complete",
      "ECONNREFUSED",
      "querySrv",
      "ENOTFOUND",
      "ETIMEDOUT",
    ].some((fragment) => message.includes(fragment))
  );
}

export async function listPujas(input: unknown) {
  const query = apiListQuerySchema.parse(input);
  const skip = (query.page - 1) * query.limit;
  const { countFilter, findFilter } = buildPujaFilters(query);
  const sort = buildPujaSort(query);

  try {
    await connectToDatabase();

    let mongoQuery = PujaModel.find(findFilter).skip(skip).limit(query.limit).lean();
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }

    const [items, total] = await Promise.all([
      mongoQuery.exec(),
      PujaModel.countDocuments(countFilter),
    ]);

    return {
      items: items.map((item) => normalizePuja(item as LeanPuja)),
      meta: {
        limit: query.limit,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  } catch (error) {
    if (shouldFallback(error)) {
      return listSamplePujas(query);
    }

    throw error;
  }
}

export async function getPujaBySlug(slug: string, input: unknown = {}) {
  const query = apiDetailQuerySchema.parse(input);

  const filter: MongoFilter = { slug };
  if (query.year) {
    filter.year = query.year;
  }
  if (!allowsUnverified({ ...query, limit: 1, page: 1, sort: "popularity" })) {
    filter.verified = true;
  }

  try {
    await connectToDatabase();
    const item = await PujaModel.findOne(filter).lean().exec();

    if (!item) {
      throw new Error("NOT_FOUND");
    }

    return normalizePuja(item as LeanPuja);
  } catch (error) {
    if (shouldFallback(error)) {
      const item = samplePujaRecords().find((puja) => {
        if (puja.slug !== slug) {
          return false;
        }
        if (query.year && puja.year !== query.year) {
          return false;
        }
        return allowsUnverified({ ...query, limit: 1, page: 1, sort: "popularity" })
          ? true
          : puja.verified;
      });

      if (!item) {
        throw new Error("NOT_FOUND");
      }

      return item;
    }

    throw error;
  }
}

export async function listSuggestedRoutes(input: unknown) {
  const query = apiRoutesListQuerySchema.parse(input);
  const skip = (query.page - 1) * query.limit;
  const filter: MongoFilter = {};

  if (query.year) {
    filter.year = query.year;
  }
  if (query.zone) {
    filter.zone = query.zone;
  }

  try {
    await connectToDatabase();

    const [items, total] = await Promise.all([
      SuggestedRouteModel.find(filter)
        .sort({ featured: -1, "name.en": 1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      SuggestedRouteModel.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => normalizeRoute(item as LeanRoute)),
      meta: {
        limit: query.limit,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  } catch (error) {
    if (shouldFallback(error)) {
      let items = sampleRouteRecords();
      if (query.year) {
        items = items.filter((route) => route.year === query.year);
      }
      if (query.zone) {
        items = items.filter((route) => route.zone === query.zone);
      }
      const total = items.length;
      return {
        items: items.slice(skip, skip + query.limit),
        meta: {
          limit: query.limit,
          page: query.page,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    }

    throw error;
  }
}

export async function getSuggestedRouteBySlug(slug: string, input: unknown = {}) {
  const query = apiRouteDetailQuerySchema.parse(input);
  const filter: MongoFilter = { slug };

  if (query.year) {
    filter.year = query.year;
  }

  try {
    await connectToDatabase();
    const item = await SuggestedRouteModel.findOne(filter).lean().exec();

    if (!item) {
      throw new Error("NOT_FOUND");
    }

    return normalizeRoute(item as LeanRoute);
  } catch (error) {
    if (shouldFallback(error)) {
      const item = sampleRouteRecords().find((route) => {
        if (route.slug !== slug) {
          return false;
        }
        return query.year ? route.year === query.year : true;
      });

      if (!item) {
        throw new Error("NOT_FOUND");
      }

      return item;
    }

    throw error;
  }
}
