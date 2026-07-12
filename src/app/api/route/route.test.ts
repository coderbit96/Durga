import { describe, expect, it } from "vitest";
import { POST } from "./route";

const origin = { coordinates: [88.3639, 22.5726], type: "Point" };
const destination = { coordinates: [88.3656, 22.6039], type: "Point" };

describe("POST /api/route", () => {
  it("returns a normalized mock route and external URL", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/route", {
        body: JSON.stringify({ destination, mode: "walking", origin }),
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fallback).toBe(false);
    expect(body.externalNavigationUrl).toContain("google.com/maps/dir");
    expect(body.route.totalDistanceMeters).toBeGreaterThan(0);
  });

  it("rejects invalid coordinates gracefully", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/route", {
        body: JSON.stringify({
          destination: { coordinates: [999, 22.6], type: "Point" },
          origin,
        }),
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
