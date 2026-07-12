"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ManualStartLocation } from "./manual-start-location";
import { LocationStatus } from "./location-status";
import { useCurrentLocation } from "@/lib/location/use-current-location";

type LocationPermissionDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function LocationPermissionDialog({
  onOpenChange,
  open,
}: LocationPermissionDialogProps) {
  const { requestLocation, setManualLocation, state, useMockLocation } =
    useCurrentLocation();

  return (
    <Dialog
      description="Location is used only in this browser session for routing and distance estimates."
      onOpenChange={onOpenChange}
      open={open}
      title="Choose a start location"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => requestLocation({ enableHighAccuracy: false, timeoutMs: 10000 })}
            type="button"
          >
            Use browser location
          </Button>
          {process.env.NODE_ENV !== "production" ? (
            <Button onClick={useMockLocation} type="button" variant="outline">
              Use dev mock
            </Button>
          ) : null}
        </div>
        <LocationStatus state={state} />
        <ManualStartLocation onSubmit={setManualLocation} />
      </div>
    </Dialog>
  );
}
