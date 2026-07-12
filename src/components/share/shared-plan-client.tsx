"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SharedPlan } from "@/domain";
import { usePlanStore } from "@/stores/plan";

type SharedPlanClientProps = {
  plan: SharedPlan;
};

export function SharedPlanClient({ plan }: SharedPlanClientProps) {
  const reorderStops = usePlanStore((state) => state.reorderStops);
  const setTravelMode = usePlanStore((state) => state.setTravelMode);
  const [message, setMessage] = useState("");
  const stops = plan.routeInput.stops
    .sort((a, b) => a.sequence - b.sequence)
    .map((stop) => stop.pujaSlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name?.en ?? "Shared Puja Plan"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This shared plan expires on {new Date(plan.expiresAt).toLocaleDateString("en-IN")}.
          Start location is excluded unless the sharer explicitly included it.
        </p>
        <ol className="space-y-2">
          {stops.map((slug, index) => (
            <li className="rounded-md border border-border bg-surface-muted p-3 text-sm" key={slug}>
              {index + 1}. {slug}
            </li>
          ))}
        </ol>
        <Button
          onClick={() => {
            reorderStops(stops);
            const firstMode = plan.routeInput.preferredModes[0];
            if (firstMode === "walking" || firstMode === "driving" || firstMode === "transit") {
              setTravelMode(firstMode);
            }
            setMessage("Shared route loaded into My Puja Plan.");
          }}
          type="button"
        >
          Load into My Puja Plan
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {message} <Link className="font-medium text-secondary" href="/plan">Open plan</Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
