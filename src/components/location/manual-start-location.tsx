"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CurrentLocation } from "@/lib/location/state";

type ManualStartLocationProps = {
  onSubmit: (location: Omit<CurrentLocation, "source">) => void;
};

export function ManualStartLocation({ onSubmit }: ManualStartLocationProps) {
  const [label, setLabel] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const [latitude, longitude] = coordinates.split(",").map((value) => Number(value.trim()));
    if (coordinates && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) {
      setMessage("Use coordinates as latitude, longitude.");
      return;
    }
    if (
      coordinates &&
      (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    ) {
      setMessage("Use valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }

    onSubmit({
      label: label || "Manual start location",
      latitude: Number.isFinite(latitude) ? latitude : 22.5726,
      longitude: Number.isFinite(longitude) ? longitude : 88.3639,
    });
    setMessage("Manual start location saved for this session.");
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-sm font-medium">
        Locality, landmark, or metro station
        <Input
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Kalighat Metro, Gariahat, Shyambazar..."
          value={label}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Coordinates fallback
        <Input
          onChange={(event) => setCoordinates(event.target.value)}
          placeholder="22.5726, 88.3639"
          value={coordinates}
        />
      </label>
      <Button type="submit" variant="secondary">
        Save manual start
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
