export type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export type CurrentLocation = {
  accuracyMeters?: number;
  label?: string;
  latitude: number;
  longitude: number;
  source: "browser" | "manual";
};

export type LocationState = {
  error?: string;
  location?: CurrentLocation;
  status: LocationStatus;
};

export type LocationAction =
  | { type: "request" }
  | { type: "success"; location: CurrentLocation }
  | { type: "permission-denied" }
  | { type: "unavailable"; error?: string }
  | { type: "timeout" }
  | { type: "unsupported" }
  | { type: "reset" };

export const initialLocationState: LocationState = {
  status: "idle",
};

export function locationReducer(
  state: LocationState,
  action: LocationAction,
): LocationState {
  switch (action.type) {
    case "request":
      return { status: "requesting" };
    case "success":
      return { location: action.location, status: "success" };
    case "permission-denied":
      return { error: "Location permission was denied.", status: "permission-denied" };
    case "unavailable":
      return {
        error: action.error ?? "Location is currently unavailable.",
        status: "unavailable",
      };
    case "timeout":
      return { error: "Location request timed out.", status: "timeout" };
    case "unsupported":
      return { error: "This browser does not support geolocation.", status: "unsupported" };
    case "reset":
      return initialLocationState;
    default:
      return state;
  }
}
