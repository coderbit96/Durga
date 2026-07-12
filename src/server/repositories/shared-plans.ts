import crypto from "node:crypto";
import {
  sharedPlanCreateRequestSchema,
  type SharedPlan,
} from "@/domain";
import { connectToDatabase } from "../db/mongoose";
import { SharedPlanModel } from "../models/shared-plan";

const devMemoryPlans = new Map<string, SharedPlan>();

function makeShareCode() {
  return crypto.randomBytes(9).toString("base64url");
}

export function getSharedPlanExpiry(hours: number, now = new Date()) {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export async function createSharedPlan(input: unknown) {
  const request = sharedPlanCreateRequestSchema.parse(input);
  const shareSlug = makeShareCode();
  const now = new Date();
  const expiresAt = getSharedPlanExpiry(request.expiresInHours, now);
  const routeInput = {
    ...request.routeInput,
    startAt: request.includeOrigin ? request.routeInput.startAt : undefined,
  };
  const plan: SharedPlan = {
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    id: crypto.randomUUID(),
    name: { bn: request.title, en: request.title },
    routeInput,
    shareSlug,
    updatedAt: now.toISOString(),
  };

  try {
    await connectToDatabase();
    await SharedPlanModel.create({
      ...plan,
      createdAt: now,
      expiresAt,
      updatedAt: now,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    devMemoryPlans.set(shareSlug, plan);
  }

  return plan;
}

export async function getSharedPlan(shareSlug: string) {
  try {
    await connectToDatabase();
    const item = await SharedPlanModel.findOne({ shareSlug }).lean().exec();
    if (!item) {
      throw new Error("NOT_FOUND");
    }
    if (new Date(item.expiresAt as Date).getTime() < Date.now()) {
      throw new Error("EXPIRED");
    }
    return {
      ...item,
      _id: undefined,
      __v: undefined,
      createdAt: (item.createdAt as Date).toISOString(),
      expiresAt: (item.expiresAt as Date).toISOString(),
      updatedAt: (item.updatedAt as Date).toISOString(),
    } as SharedPlan;
  } catch (error) {
    const memoryPlan = devMemoryPlans.get(shareSlug);
    if (memoryPlan) {
      if (new Date(memoryPlan.expiresAt).getTime() < Date.now()) {
        throw new Error("EXPIRED");
      }
      return memoryPlan;
    }
    throw error;
  }
}
