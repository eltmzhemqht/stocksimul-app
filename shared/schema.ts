import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("100000.00"),
});

export const stocks = pgTable("stocks", {
  id: varchar("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousClose: decimal("previous_close", { precision: 10, scale: 2 }).notNull(),
});

export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stockId: varchar("stock_id").notNull(),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stockId: varchar("stock_id").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sentiment: text("sentiment").notNull(),
  impact: decimal("impact", { precision: 3, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  symbols: text("symbols").notNull(), // JSON 배열을 문자열로 저장
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  password: true,
}).partial({ id: true });

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  timestamp: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  cashBalance: number;
}

export interface HoldingWithStock extends Holding {
  stock: Stock;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface TransactionWithStock extends Transaction {
  stock: Stock;
}
