import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as listRoutes } from "./route";
import { GET as getRoute } from "./[slug]/route";
import {
  getSuggestedRouteBySlug,
  listSuggestedRoutes,
} from "@/server/repositories/pujas";

vi.mock("@/server/repositories/pujas", () => ({
  getSuggestedRouteBySlug: vi.fn(),
  listSuggestedRoutes: vi.fn(),
}));

const mockedListSuggestedRoutes = vi.mocked(listSuggestedRoutes);
const mockedGetSuggestedRouteBySlug = vi.mocked(getSuggestedRouteBySlug);

describe("routes API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns route list responses with public cache headers", async () => {
    mockedListSuggestedRoutes.mockResolvedValue({
      items: [],
      meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
    });

    const response = await listRoutes(
      new Request("http://localhost:3000/api/routes?year=2026"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("stale-while-revalidate");
    expect(mockedListSuggestedRoutes).toHaveBeenCalledWith({ year: "2026" });
  });

  it("passes slug and query values to the route detail repository", async () => {
    mockedGetSuggestedRouteBySlug.mockResolvedValue({
      createdAt: "2026-01-01T00:00:00.000+05:30",
      description: { bn: "নমুনা", en: "Sample" },
      durationMinutes: 120,
      featured: false,
      name: { bn: "নমুনা", en: "Sample" },
      slug: "sample-route",
      stops: [
        {
          dwellMinutes: 20,
          pujaSlug: "sample-puja",
          sequence: 1,
        },
        {
          dwellMinutes: 20,
          pujaSlug: "sample-puja-two",
          sequence: 2,
        },
      ],
      summary: { bn: "নমুনা", en: "Sample" },
      tags: [],
      travelMode: "mixed",
      updatedAt: "2026-01-01T00:00:00.000+05:30",
      year: 2026,
    });

    const response = await getRoute(
      new Request("http://localhost:3000/api/routes/sample-route?year=2026"),
      { params: Promise.resolve({ slug: "sample-route" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slug).toBe("sample-route");
    expect(mockedGetSuggestedRouteBySlug).toHaveBeenCalledWith("sample-route", {
      year: "2026",
    });
  });
});
