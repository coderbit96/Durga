import mongoose, { Schema, type Model } from "mongoose";
import type { SharedPlan } from "../../domain";
import {
  GeoPointMongooseSchema,
  LocalizedTextMongooseSchema,
  RouteStopMongooseSchema,
} from "./schemas";

export type SharedPlanDocument = Omit<
  SharedPlan,
  "createdAt" | "expiresAt" | "updatedAt"
> & {
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
};

const RouteInputSchema = new Schema(
  {
    avoidCrowds: { default: false, type: Boolean },
    endAt: { type: GeoPointMongooseSchema },
    maxStops: { max: 25, min: 1, required: true, type: Number },
    preferredModes: {
      required: true,
      type: [
        {
          enum: ["walking", "driving", "transit", "metro", "rail", "mixed"],
          type: String,
        },
      ],
    },
    startAt: { type: GeoPointMongooseSchema },
    stops: { required: true, type: [RouteStopMongooseSchema] },
    year: { required: true, type: Number },
  },
  { _id: false },
);

const SharedPlanSchema = new Schema<SharedPlanDocument>(
  {
    expiresAt: { required: true, type: Date },
    id: { required: true, trim: true, type: String },
    name: { type: LocalizedTextMongooseSchema },
    routeInput: { required: true, type: RouteInputSchema },
    shareSlug: { required: true, trim: true, type: String },
  },
  { timestamps: true },
);

SharedPlanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SharedPlanSchema.index({ shareSlug: 1 }, { unique: true });
SharedPlanSchema.index({ id: 1 });

export const SharedPlanModel =
  (mongoose.models.SharedPlan as Model<SharedPlanDocument> | undefined) ??
  mongoose.model<SharedPlanDocument>("SharedPlan", SharedPlanSchema);
