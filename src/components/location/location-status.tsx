import type { LocationState } from "@/lib/location/state";

type LocationStatusProps = {
  state: LocationState;
};

export function LocationStatus({ state }: LocationStatusProps) {
  if (state.status === "idle") {
    return <p className="text-sm text-muted-foreground">Location not enabled.</p>;
  }

  if (state.status === "requesting") {
    return <p className="text-sm text-muted-foreground">Requesting location...</p>;
  }

  if (state.status === "success" && state.location) {
    return (
      <p className="text-sm text-muted-foreground">
        Start location set
        {state.location.label ? `: ${state.location.label}` : ""}.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground" role="alert">
      {state.error ?? "Location could not be determined."}
    </p>
  );
}
