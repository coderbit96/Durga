"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-4 py-12">
      <p className="text-sm font-medium text-primary">Something went wrong</p>
      <h1 className="text-3xl font-semibold">The route lost its way.</h1>
      <p className="max-w-xl text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
