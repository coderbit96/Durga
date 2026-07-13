import { describe, expect, it } from "vitest";
import {
  initialLocationState,
  locationReducer,
} from "./state";

describe("location state", () => {
  it("moves through request and success states", () => {
    const requesting = locationReducer(initialLocationState, { type: "request" });
    const success = locationReducer(requesting, {
      location: {
        latitude: 22.5726,
        longitude: 88.3639,
        source: "browser",
      },
      type: "success",
    });

    expect(requesting.status).toBe("requesting");
    expect(success.status).toBe("success");
    expect(success.location?.source).toBe("browser");
  });

  it("represents permission and timeout failures", () => {
    expect(
      locationReducer(initialLocationState, { type: "permission-denied" }).status,
    ).toBe("permission-denied");
    expect(locationReducer(initialLocationState, { type: "timeout" }).status).toBe(
      "timeout",
    );
  });
});
