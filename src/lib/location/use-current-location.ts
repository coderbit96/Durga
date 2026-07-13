"use client";

import { useEffect, useReducer } from "react";
import {
  initialLocationState,
  locationReducer,
  type CurrentLocation,
} from "./state";

const storageKey = "pujopath-session-location";

type LocationOptions = {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
};

function readStoredLocation() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as Partial<CurrentLocation>;
    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number" ||
      !Number.isFinite(parsed.latitude) ||
      !Number.isFinite(parsed.longitude) ||
      (parsed.source !== "browser" && parsed.source !== "manual")
    ) {
      window.sessionStorage.removeItem(storageKey);
      return undefined;
    }

    return parsed as CurrentLocation;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return undefined;
  }
}

function writeStoredLocation(location: CurrentLocation) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(location));
}

export function useCurrentLocation() {
  const [state, dispatch] = useReducer(locationReducer, initialLocationState);

  useEffect(() => {
    const stored = readStoredLocation();
    if (stored) {
      dispatch({ location: stored, type: "success" });
    }
  }, []);

  function requestLocation(options: LocationOptions = {}) {
    if (!navigator.geolocation) {
      dispatch({ type: "unsupported" });
      return;
    }

    dispatch({ type: "request" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: CurrentLocation = {
          accuracyMeters: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "browser",
        };
        writeStoredLocation(location);
        dispatch({ location, type: "success" });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          dispatch({ type: "permission-denied" });
        } else if (error.code === error.TIMEOUT) {
          dispatch({ type: "timeout" });
        } else {
          dispatch({ error: error.message, type: "unavailable" });
        }
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? false,
        maximumAge: 300000,
        timeout: options.timeoutMs ?? 10000,
      },
    );
  }

  function setManualLocation(location: Omit<CurrentLocation, "source">) {
    const next: CurrentLocation = { ...location, source: "manual" };
    writeStoredLocation(next);
    dispatch({ location: next, type: "success" });
  }

  return {
    requestLocation,
    setManualLocation,
    state,
  };
}
