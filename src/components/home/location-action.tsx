"use client";

import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentLocation } from "@/lib/location/use-current-location";
import { LocationStatus } from "@/components/location/location-status";

export function LocationAction() {
  const { requestLocation, state } = useCurrentLocation();

  return (
    <div className="space-y-2">
      <Button
        onClick={() => requestLocation({ enableHighAccuracy: false, timeoutMs: 10000 })}
        type="button"
        variant="outline"
      >
        <LocateFixed aria-hidden="true" size={18} />
        {state.status === "requesting" ? "Finding location..." : "Use My Current Location"}
      </Button>
      <LocationStatus state={state} />
    </div>
  );
}
