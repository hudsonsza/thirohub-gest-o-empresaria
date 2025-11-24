import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  stores, 
  Store, 
  InsertStore,
  products,
  Product,
  InsertProduct,
  orders,
  Order,
  InsertOrder,
  coupons,
  Coupon,
  InsertCoupon,
  trackingLinks,
  TrackingLink,
  InsertTrackingLink,
  affiliates,
  Affiliate,
  InsertAffiliate,
  sales,
  Sale,
  InsertSale
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USERS ============
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ STORES ============
export async function createStore(store: InsertStore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(stores).values(store);
  return result;
}

export async function getStoreById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreByAccessCode(accessCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.accessCode, accessCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoresByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stores).where(eq(stores.userId, userId));
}

export async function getAllStores() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stores).orderBy(stores.createdAt);
}

export async function updateStore(id: number, data: Partial<InsertStore>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(stores).set(data).where(eq(stores.id, id));
}

export async function deleteStore(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(stores).where(eq(stores.id, id));
}

// ============ PRODUCTS ============
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(products).values(product);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));
}

export async function getActiveProductsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products)
    .where(and(eq(products.storeId, storeId), eq(products.status, 'active')))
    .orderBy(desc(products.featured), desc(products.createdAt));
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(products).where(eq(products.id, id));
}

// ============ ORDERS ============
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(orders).values(order);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(orders).set(data).where(eq(orders.id, id));
}

// ============ COUPONS ============
export async function createCoupon(coupon: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(coupons).values(coupon);
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCouponByCode(storeId: number, code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(coupons)
    .where(and(eq(coupons.storeId, storeId), eq(coupons.code, code)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCouponsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(coupons)
    .where(eq(coupons.storeId, storeId))
    .orderBy(desc(coupons.createdAt));
}

export async function updateCoupon(id: number, data: Partial<InsertCoupon>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(coupons).set(data).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(coupons).where(eq(coupons.id, id));
}

// ============ TRACKING LINKS ============
export async function createTrackingLink(link: InsertTrackingLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(trackingLinks).values(link);
}

export async function getTrackingLinkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(trackingLinks).where(eq(trackingLinks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTrackingLinkBySlug(storeId: number, slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(trackingLinks)
    .where(and(eq(trackingLinks.storeId, storeId), eq(trackingLinks.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTrackingLinksByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(trackingLinks)
    .where(eq(trackingLinks.storeId, storeId))
    .orderBy(desc(trackingLinks.createdAt));
}

export async function updateTrackingLink(id: number, data: Partial<InsertTrackingLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(trackingLinks).set(data).where(eq(trackingLinks.id, id));
}

export async function incrementTrackingLinkClick(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const link = await getTrackingLinkById(id);
  if (!link) return;
  
  return await db.update(trackingLinks)
    .set({ clicks: (link.clicks || 0) + 1 })
    .where(eq(trackingLinks.id, id));
}

export async function deleteTrackingLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(trackingLinks).where(eq(trackingLinks.id, id));
}

// ============ AFFILIATES ============
export async function createAffiliate(affiliate: InsertAffiliate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(affiliates).values(affiliate);
}

export async function getAffiliateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliatesByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(affiliates)
    .where(eq(affiliates.storeId, storeId))
    .orderBy(desc(affiliates.createdAt));
}

export async function updateAffiliate(id: number, data: Partial<InsertAffiliate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(affiliates).set(data).where(eq(affiliates.id, id));
}

export async function deleteAffiliate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(affiliates).where(eq(affiliates.id, id));
}

// ============ SALES ============
export async function createSale(sale: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(sales).values(sale);
}

export async function getSalesByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sales)
    .where(eq(sales.storeId, storeId))
    .orderBy(desc(sales.createdAt));
}

export async function getSalesByAffiliateId(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sales)
    .where(eq(sales.affiliateId, affiliateId))
    .orderBy(desc(sales.createdAt));
}

// ============ UTILITIES ============
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateAffiliateCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${random}`;
}
