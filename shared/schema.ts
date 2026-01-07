import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").notNull().default("homeowner"),
  verified: boolean("verified").notNull().default(false),
  ratings: real("ratings").array().default([]),
  stripeCustomerId: text("stripe_customer_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Jobs table
export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  homeownerId: varchar("homeowner_id").notNull(),
  contractorId: varchar("contractor_id"),
  title: text("title"),
  description: text("description").notNull(),
  price: real("price"),
  status: text("status").notNull().default("requested"),
  lat: real("lat").notNull().default(29.7604),
  lng: real("lng").notNull().default(-95.3698),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Contractors table
export const contractors = pgTable("contractors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  rating: real("rating").notNull().default(5.0),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  stripeId: text("stripe_id").notNull(),
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
});

export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Contractor = typeof contractors.$inferSelect;

// Disputes table
export const disputes = pgTable("disputes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull(),
  contractorId: varchar("contractor_id").notNull(),
  homeownerId: varchar("homeowner_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
});

export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// AI Chat - Conversations table
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// AI Chat - Messages table
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
