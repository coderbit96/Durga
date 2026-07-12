import mongoose, { Schema, type Model } from "mongoose";
import type { SuggestedRoute } from "../../domain";
import { LocalizedTextMongooseSchema, RouteStopMongooseSchema } from "./schemas";

export type SuggestedRouteDocument = Omit<
  SuggestedRoute,
  "createdAt" | "updatedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
};

const SuggestedRouteSchema = new Schema<SuggestedRouteDocument>(
  {
    description: { required: true, type: LocalizedTextMongooseSchema },
    distanceMeters: { min: 0, type: Number },
    durationMinutes: { min: 1, required: true, type: Number },
    featured: { default: false, type: Boolean },
    name: { required: true, type: LocalizedTextMongooseSchema },
    slug: { required: true, trim: true, type: String },
    stops: { required: true, type: [RouteStopMongooseSchema] },
    summary: { required: true, type: LocalizedTextMongooseSchema },
    tags: { default: [], type: [{ type: String }] },
    travelMode: {
      enum: ["walking", "driving", "transit", "metro", "rail", "mixed"],
      required: true,
      type: String,
    },
    year: { required: true, type: Number },
    zone: {
      enum: [
        "north-kolkata",
        "south-kolkata",
        "central-kolkata",
        "east-kolkata",
        "west-kolkata",
      ],
      type: String,
    },
  },
  { timestamps: true },
);

SuggestedRouteSchema.index({ slug: 1, year: 1 }, { unique: true });
SuggestedRouteSchema.index({ year: 1, featured: 1 });
SuggestedRouteSchema.index({
  "description.bn": "text",
  "description.en": "text",
  "name.bn": "text",
  "name.en": "text",
  "summary.bn": "text",
  "summary.en": "text",
  tags: "text",
});

export const SuggestedRouteModel =
  (mongoose.models.SuggestedRoute as
    | Model<SuggestedRouteDocument>
    | undefined) ??
  mongoose.model<SuggestedRouteDocument>(
    "SuggestedRoute",
    SuggestedRouteSchema,
  );
