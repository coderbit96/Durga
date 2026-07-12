import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/public-env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: "/",
        disallow: ["/api/", "/share/", "/*?*"],
        userAgent: "*",
      },
    ],
    sitemap: `${publicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
