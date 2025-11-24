import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stores - Lojas virtuais criadas pelos clientes
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Relaciona com users.id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull(),
  ownerName: varchar("ownerName", { length: 255 }).notNull(),
  ownerWhatsapp: varchar("ownerWhatsapp", { length: 20 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  category: varchar("category", { length: 100 }),
  plan: mysqlEnum("plan", ["basic", "pro", "platinum"]).default("basic").notNull(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0F766E"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#F59E0B"),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  trialEndsAt: timestamp("trialEndsAt"),
  accessCode: varchar("accessCode", { length: 32 }).notNull().unique(),
  plainPassword: text("plainPassword"), // Senha em texto plano (apenas para uso administrativo)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Products - Produtos das lojas
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // Preço em centavos
  category: varchar("category", { length: 100 }),
  images: json("images").$type<string[]>(),
  videoUrl: text("videoUrl"), // Pro/Platinum only
  stock: int("stock").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  featured: boolean("featured").default(false).notNull(),
  availableForAffiliates: boolean("availableForAffiliates").default(false).notNull(), // Platinum only
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders - Pedidos dos clientes
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerAddress: json("customerAddress").$type<{
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }>(),
  items: json("items").$type<Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>>(),
  subtotal: int("subtotal").notNull(), // Em centavos
  discount: int("discount").default(0).notNull(), // Em centavos
  shipping: int("shipping").default(0).notNull(), // Em centavos
  total: int("total").notNull(), // Em centavos
  status: mysqlEnum("status", ["new", "confirmed", "shipped", "delivered", "cancelled"]).default("new").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  shippingMethod: varchar("shippingMethod", { length: 50 }),
  notes: text("notes"),
  couponCode: varchar("couponCode", { length: 50 }),
  affiliateCode: varchar("affiliateCode", { length: 50 }),
  trackingLink: varchar("trackingLink", { length: 255 }),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Coupons - Cupons de desconto (Pro/Platinum)
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["percentage", "fixed"]).notNull(),
  value: int("value").notNull(), // Percentual (0-100) ou valor fixo em centavos
  minPurchase: int("minPurchase").default(0).notNull(), // Em centavos
  maxUses: int("maxUses").default(0).notNull(), // 0 = ilimitado
  currentUses: int("currentUses").default(0).notNull(),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * TrackingLinks - Links rastreáveis (Pro/Platinum)
 */
export const trackingLinks = mysqlTable("trackingLinks", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  targetUrl: text("targetUrl").notNull(),
  productId: int("productId"), // Opcional - produto específico
  clicks: int("clicks").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = typeof trackingLinks.$inferInsert;

/**
 * Affiliates - Afiliados (Platinum)
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  commissionPercentage: int("commissionPercentage").notNull(), // 0-100
  affiliateCode: varchar("affiliateCode", { length: 50 }).notNull().unique(),
  totalClicks: int("totalClicks").default(0).notNull(),
  totalSales: int("totalSales").default(0).notNull(),
  totalCommission: int("totalCommission").default(0).notNull(), // Em centavos
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Sales - Vendas registradas para analytics
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  orderId: int("orderId").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 50 }),
  affiliateId: int("affiliateId"),
  trackingLink: varchar("trackingLink", { length: 255 }),
  saleValue: int("saleValue").notNull(), // Em centavos
  commissionPercentage: int("commissionPercentage").default(0).notNull(),
  commissionValue: int("commissionValue").default(0).notNull(), // Em centavos
  customerEmail: varchar("customerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * StoreSessions - Sessões de login dos lojistas (autenticação própria)
 */
export const storeSessions = mysqlTable("storeSessions", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("passwordHash").notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).unique(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreSession = typeof storeSessions.$inferSelect;
export type InsertStoreSession = typeof storeSessions.$inferInsert;

/**
 * AdminUsers - Administradores do painel principal
 */
export const adminUsers = mysqlTable("adminUsers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: varchar("name", { length: 255 }),
  sessionToken: varchar("sessionToken", { length: 255 }).unique(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
