"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/stores/plan";

type UseRouteButtonProps = {
  stops: string[];
};

export function UseRouteButton({ stops }: UseRouteButtonProps) {
  const reorderStops = usePlanStore((state) => state.reorderStops);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          reorderStops(stops);
          setMessage("Route stops copied to My Puja Plan.");
        }}
        type="button"
      >
        Use This Route
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message} <Link className="font-medium text-secondary" href="/plan">Open plan</Link>
        </p>
      ) : null}
    </div>
  );
}
