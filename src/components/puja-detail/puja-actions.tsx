"use client";

import { useState } from "react";
import { Heart, LocateFixed, Navigation, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationPermissionDialog } from "@/components/location/location-permission-dialog";
import { useFavoritesStore } from "@/stores/favorites";
import { usePlanStore } from "@/stores/plan";

type PujaActionsProps = {
  navigationUrl: string;
  shareUrl: string;
  slug: string;
};

export function PujaActions({ navigationUrl, shareUrl, slug }: PujaActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const addStop = usePlanStore((state) => state.addStop);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const favorite = useFavoritesStore((state) => state.ids.includes(slug));

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: "PujoPath Kolkata",
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setMessage("Share link copied.");
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          onClick={() => {
            setMessage(addStop(slug) ? "Added to plan." : "Already in plan or plan is full.");
          }}
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" size={16} />
          Add to Plan
        </Button>
        <Button
          onClick={() => {
            toggleFavorite(slug);
            setMessage(favorite ? "Removed from favorites." : "Added to favorites.");
          }}
          type="button"
          variant="outline"
        >
          <Heart aria-hidden="true" size={16} />
          {favorite ? "Favorited" : "Favorite"}
        </Button>
        <Button onClick={() => setDialogOpen(true)} type="button" variant="outline">
          <LocateFixed aria-hidden="true" size={16} />
          Start location
        </Button>
        <Button asChild variant="secondary">
          <a href={navigationUrl} rel="noreferrer" target="_blank">
            <Navigation aria-hidden="true" size={16} />
            Navigate
          </a>
        </Button>
      </div>
      <Button className="w-full" onClick={share} type="button" variant="ghost">
        <Share2 aria-hidden="true" size={16} />
        Share
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
      <LocationPermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
