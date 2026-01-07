import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

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

export const insertJobSchema = createInsertSchema(jobs, {
  homeownerId: z.string(),
  description: z.string(),
  title: z.string().optional(),
  contractorId: z.string().optional(),
  price: z.number().optional(),
  status: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type InsertJob = InferInsertModel<typeof jobs>;
export type Job = InferSelectModel<typeof jobs>;

// Contractors table
export const contractors = pgTable("contractors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  rating: real("rating").notNull().default(5.0),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  stripeId: text("stripe_id").notNull(),
});

export const insertContractorSchema = createInsertSchema(contractors, {
  name: z.string(),
  rating: z.number().optional(),
  lat: z.number(),
  lng: z.number(),
  stripeId: z.string(),
});

export type InsertContractor = InferInsertModel<typeof contractors>;
export type Contractor = InferSelectModel<typeof contractors>;

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

export const insertDisputeSchema = createInsertSchema(disputes, {
  jobId: z.number(),
  contractorId: z.string(),
  homeownerId: z.string(),
  reason: z.string(),
  status: z.string().optional(),
});

export type InsertDispute = InferInsertModel<typeof disputes>;
export type Dispute = InferSelectModel<typeof disputes>;

// Notifications table
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  userId: z.string(),
  message: z.string(),
  read: z.boolean().optional(),
});

export type InsertNotification = InferInsertModel<typeof notifications>;
export type Notification = InferSelectModel<typeof notifications>;

// AI Chat - Conversations table
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations, {
  title: z.string(),
});

export type InsertConversation = InferInsertModel<typeof conversations>;
export type Conversation = InferSelectModel<typeof conversations>;

// AI Chat - Messages table
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages, {
  conversationId: z.number(),
  role: z.string(),
  content: z.string(),
});

export type InsertMessage = InferInsertModel<typeof messages>;
export type Message = InferSelectModel<typeof messages>;

// Direct Messages table for user-to-user communication
export const directMessages = pgTable("direct_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  jobId: integer("job_id"),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDirectMessageSchema = createInsertSchema(directMessages, {
  senderId: z.string(),
  receiverId: z.string(),
  jobId: z.number().optional(),
  content: z.string(),
  read: z.boolean().optional(),
});

export type InsertDirectMessage = InferInsertModel<typeof directMessages>;
export type DirectMessage = InferSelectModel<typeof directMessages>;
