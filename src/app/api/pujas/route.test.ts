import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as listPujas } from "./route";
import { GET as getPuja } from "./[slug]/route";
import {
  getPujaBySlug,
  listPujas as listPujasRepository,
} from "@/server/repositories/pujas";

vi.mock("@/server/repositories/pujas", () => ({
  getPujaBySlug: vi.fn(),
  listPujas: vi.fn(),
}));

const mockedListPujas = vi.mocked(listPujasRepository);
const mockedGetPujaBySlug = vi.mocked(getPujaBySlug);

describe("pujas API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes validated-style query values to the puja repository", async () => {
    mockedListPujas.mockResolvedValue({
      items: [],
      meta: { limit: 10, page: 1, total: 0, totalPages: 0 },
    });

    const response = await listPujas(
      new Request(
        "http://localhost:3000/api/pujas?zone=north-kolkata&nearLat=22.6&nearLng=88.36&sort=nearest&limit=10",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
    expect(mockedListPujas).toHaveBeenCalledWith({
      limit: "10",
      nearLat: "22.6",
      nearLng: "88.36",
      sort: "nearest",
      zone: "north-kolkata",
    });
  });

  it("returns a consistent validation error response", async () => {
    mockedListPujas.mockRejectedValue(
      new Error("Unexpected test error"),
    );

    const response = await listPujas(new Request("http://localhost:3000/api/pujas"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("returns 404 for missing puja details", async () => {
    mockedGetPujaBySlug.mockRejectedValue(new Error("NOT_FOUND"));

    const response = await getPuja(
      new Request("http://localhost:3000/api/pujas/sample-missing"),
      { params: Promise.resolve({ slug: "sample-missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
