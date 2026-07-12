import mongoose from "mongoose";
import { env } from "../../lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV !== "production") {
  globalThis.mongooseCache = cached;
}

function getMongoUri() {
  if (!env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required before connecting to MongoDB. Add it to .env.local.",
    );
  }

  return env.MONGODB_URI;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getMongoUri(), {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error: unknown) => {
        cached.promise = null;
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`MongoDB connection failed: ${message}`);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export async function checkDatabaseHealth() {
  try {
    const instance = await connectToDatabase();
    await instance.connection.db?.admin().command({ ping: 1 });

    return {
      dbName: instance.connection.name,
      host: instance.connection.host,
      ok: true,
      readyState: instance.connection.readyState,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      ok: false,
      readyState: mongoose.connection.readyState,
    };
  }
}
