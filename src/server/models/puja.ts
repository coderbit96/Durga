import mongoose, { Schema, type Model } from "mongoose";
import type { Puja } from "../../domain";
import { GeoPointMongooseSchema, LocalizedTextMongooseSchema } from "./schemas";

export type PujaDocument = Omit<
  Puja,
  "createdAt" | "lastVerifiedAt" | "updatedAt"
> & {
  createdAt: Date;
  lastVerifiedAt: Date;
  updatedAt: Date;
};

const AccessibilitySchema = new Schema(
  {
    crowdLevel: {
      enum: ["low", "medium", "high", "very-high"],
      required: true,
      type: String,
    },
    notes: { type: LocalizedTextMongooseSchema },
    seniorFriendly: { required: true, type: Boolean },
    wheelchairAccess: { required: true, type: Boolean },
  },
  { _id: false },
);

const PujaImageSchema = new Schema(
  {
    alt: { required: true, type: LocalizedTextMongooseSchema },
    credit: { trim: true, type: String },
    height: { min: 1, type: Number },
    url: { required: true, trim: true, type: String },
    width: { min: 1, type: Number },
  },
  { _id: false },
);

const OfficialLinksSchema = new Schema(
  {
    facebook: { trim: true, type: String },
    instagram: { trim: true, type: String },
    maps: { trim: true, type: String },
    website: { trim: true, type: String },
  },
  { _id: false },
);

const PujaCategories = [
  "barowari",
  "bonedi-bari",
  "community",
  "family-friendly",
  "heritage",
  "theme",
  "traditional",
  "award-winning",
];

const PujaSchema = new Schema<PujaDocument>(
  {
    accessibility: { required: true, type: AccessibilitySchema },
    address: { required: true, type: LocalizedTextMongooseSchema },
    bestVisitTime: { required: true, type: LocalizedTextMongooseSchema },
    categories: {
      default: [],
      required: true,
      type: [{ enum: PujaCategories, type: String }],
    },
    committeeName: { type: LocalizedTextMongooseSchema },
    exitRecommendation: { required: true, type: LocalizedTextMongooseSchema },
    featured: { default: false, index: true, type: Boolean },
    images: { default: [], type: [PujaImageSchema] },
    lastVerifiedAt: { required: true, type: Date },
    locality: { index: true, required: true, trim: true, type: String },
    location: { required: true, type: GeoPointMongooseSchema },
    name: { required: true, type: LocalizedTextMongooseSchema },
    nearbyLandmark: { required: true, type: LocalizedTextMongooseSchema },
    nearestMetro: { trim: true, type: String },
    nearestRailwayStation: { trim: true, type: String },
    officialLinks: { default: {}, type: OfficialLinksSchema },
    popularityScore: {
      default: 0,
      index: true,
      max: 100,
      min: 0,
      type: Number,
    },
    recommendedEntry: { required: true, type: LocalizedTextMongooseSchema },
    slug: { required: true, trim: true, type: String },
    sourceNote: { required: true, type: LocalizedTextMongooseSchema },
    tags: { default: [], type: [String] },
    themeDescription: { required: true, type: LocalizedTextMongooseSchema },
    themeTitle: { required: true, type: LocalizedTextMongooseSchema },
    verified: { default: false, index: true, type: Boolean },
    year: { index: true, required: true, type: Number },
    zone: {
      enum: [
        "north-kolkata",
        "south-kolkata",
        "central-kolkata",
        "east-kolkata",
        "west-kolkata",
      ],
      index: true,
      required: true,
      type: String,
    },
  },
  { timestamps: true },
);

PujaSchema.index({ slug: 1, year: 1 }, { unique: true });
PujaSchema.index({ location: "2dsphere" });
PujaSchema.index({ zone: 1, year: 1, featured: 1, popularityScore: -1 });
PujaSchema.index({
  "address.bn": "text",
  "address.en": "text",
  locality: "text",
  "name.bn": "text",
  "name.en": "text",
  tags: "text",
  "themeDescription.bn": "text",
  "themeDescription.en": "text",
  "themeTitle.bn": "text",
  "themeTitle.en": "text",
});

export const PujaModel =
  (mongoose.models.Puja as Model<PujaDocument> | undefined) ??
  mongoose.model<PujaDocument>("Puja", PujaSchema);
