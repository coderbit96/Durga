import { Schema } from "mongoose";

export const LocalizedTextMongooseSchema = new Schema(
  {
    bn: { required: true, trim: true, type: String },
    en: { required: true, trim: true, type: String },
  },
  { _id: false },
);

export const GeoPointMongooseSchema = new Schema(
  {
    coordinates: {
      required: true,
      type: [Number],
      validate: {
        message:
          "GeoJSON coordinates must be [longitude, latitude] with valid ranges.",
        validator(value: number[]) {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }

          const [longitude, latitude] = value;
          return (
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90
          );
        },
      },
    },
    type: { default: "Point", enum: ["Point"], required: true, type: String },
  },
  { _id: false },
);

export const RouteStopMongooseSchema = new Schema(
  {
    arrivalWindow: { trim: true, type: String },
    dwellMinutes: { default: 20, max: 240, min: 0, type: Number },
    location: { type: GeoPointMongooseSchema },
    notes: { type: LocalizedTextMongooseSchema },
    pujaSlug: { required: true, trim: true, type: String },
    sequence: { min: 1, required: true, type: Number },
  },
  { _id: false },
);
