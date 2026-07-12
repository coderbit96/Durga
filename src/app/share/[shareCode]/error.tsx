"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function SharedPlanError() {
  return (
    <Container className="space-y-4 py-10">
      <h1 className="text-3xl font-semibold">Shared plan unavailable</h1>
      <p className="text-muted-foreground">
        The plan may have expired or the share link may be incorrect.
      </p>
      <Button asChild>
        <Link href="/routes">Browse suggested routes</Link>
      </Button>
    </Container>
  );
}
