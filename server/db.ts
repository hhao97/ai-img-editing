import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, user, imageGenerations, imageEdits } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

// Export the underlying database client for BetterAuth
export const db = await getDb();

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(user).values(values).onConflictDoUpdate({
      target: user.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(user).where(eq(user.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by email (for BetterAuth)
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(user).where(eq(user.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by id (for BetterAuth)
 */
export async function getUserById(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(user).where(eq(user.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new image generation record
 */
export async function createImageGeneration(
  userId: string,
  prompt: string,
  imageUrl: string,
  imageKey?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `img_gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  await db.insert(imageGenerations).values({
    id,
    userId,
    prompt,
    imageUrl,
    imageKey,
    status: "completed",
  });
}

/**
 * Get user's image generation history
 */
export async function getUserImageGenerations(userId: string, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(imageGenerations)
    .where(eq(imageGenerations.userId, userId))
    .orderBy(desc(imageGenerations.createdAt))
    .limit(limit);
}

/**
 * Create a new image edit record
 */
export async function createImageEdit(
  userId: string,
  originalImageUrl: string,
  editPrompt: string,
  editedImageUrl: string,
  originalImageKey?: string,
  editedImageKey?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `img_edit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  await db.insert(imageEdits).values({
    id,
    userId,
    originalImageUrl,
    editPrompt,
    editedImageUrl,
    originalImageKey,
    editedImageKey,
    status: "completed",
  });
}

/**
 * Get user's image edit history
 */
export async function getUserImageEdits(userId: string, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(imageEdits)
    .where(eq(imageEdits.userId, userId))
    .orderBy(desc(imageEdits.createdAt))
    .limit(limit);
}
