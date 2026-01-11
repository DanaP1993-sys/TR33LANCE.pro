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
  isIndependent: boolean("is_independent").notNull().default(true),
  liabilityAccepted: boolean("liability_accepted").notNull().default(true),
});

export const insertContractorSchema = createInsertSchema(contractors, {
  name: z.string(),
  rating: z.number().optional(),
  lat: z.number(),
  lng: z.number(),
  stripeId: z.string(),
  isIndependent: z.boolean().optional(),
  liabilityAccepted: z.boolean().optional(),
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

// Drone Surveys table for aerial mapping
export const droneSurveys = pgTable("drone_surveys", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id"),
  contractorId: varchar("contractor_id"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  altitude: real("altitude").notNull().default(50),
  status: text("status").notNull().default("scheduled"),
  mapUrl: text("map_url"),
  modelUrl: text("model_url"),
  imageCount: integer("image_count").default(0),
  areaSquareMeters: real("area_square_meters"),
  findings: text("findings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertDroneSurveySchema = createInsertSchema(droneSurveys, {
  jobId: z.number().optional(),
  contractorId: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  altitude: z.number().optional(),
  status: z.string().optional(),
  mapUrl: z.string().optional(),
  modelUrl: z.string().optional(),
  imageCount: z.number().optional(),
  areaSquareMeters: z.number().optional(),
  findings: z.string().optional(),
});

export type InsertDroneSurvey = InferInsertModel<typeof droneSurveys>;
export type DroneSurvey = InferSelectModel<typeof droneSurveys>;

// Tree Sensors table for IoT monitoring
export const treeSensors = pgTable("tree_sensors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  treeId: varchar("tree_id").notNull(),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  species: text("species"),
  soilMoisture: real("soil_moisture"),
  structuralHealth: real("structural_health"),
  leafHealth: real("leaf_health"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  lastReading: timestamp("last_reading"),
  status: text("status").notNull().default("active"),
  batteryLevel: real("battery_level").default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTreeSensorSchema = createInsertSchema(treeSensors, {
  treeId: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  species: z.string().optional(),
  soilMoisture: z.number().optional(),
  structuralHealth: z.number().optional(),
  leafHealth: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  status: z.string().optional(),
  batteryLevel: z.number().optional(),
});

export type InsertTreeSensor = InferInsertModel<typeof treeSensors>;
export type TreeSensor = InferSelectModel<typeof treeSensors>;

// Sensor Readings table for historical data
export const sensorReadings = pgTable("sensor_readings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sensorId: integer("sensor_id").notNull(),
  soilMoisture: real("soil_moisture"),
  structuralHealth: real("structural_health"),
  leafHealth: real("leaf_health"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadings, {
  sensorId: z.number(),
  soilMoisture: z.number().optional(),
  structuralHealth: z.number().optional(),
  leafHealth: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
});

export type InsertSensorReading = InferInsertModel<typeof sensorReadings>;
export type SensorReading = InferSelectModel<typeof sensorReadings>;

// Job Photos table for before/after documentation
export const jobPhotos = pgTable("job_photos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull(),
  type: text("type").notNull(), // 'before', 'after', 'estimate'
  url: text("url").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  verified: boolean("verified").notNull().default(false),
});

export const insertJobPhotoSchema = createInsertSchema(jobPhotos, {
  jobId: z.number(),
  type: z.enum(["before", "after", "estimate"]),
  url: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  verified: z.boolean().optional(),
});

export type InsertJobPhoto = InferInsertModel<typeof jobPhotos>;
export type JobPhoto = InferSelectModel<typeof jobPhotos>;

// Contractor Verification table for tier system
export const contractorVerifications = pgTable("contractor_verifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  contractorId: varchar("contractor_id").notNull(),
  tier: text("tier").notNull().default("bronze"), // 'bronze', 'silver', 'gold'
  hasInsurance: boolean("has_insurance").notNull().default(false),
  insuranceExpiry: timestamp("insurance_expiry"),
  hasLicense: boolean("has_license").notNull().default(false),
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry"),
  backgroundCheck: boolean("background_check").notNull().default(false),
  bondAmount: real("bond_amount"),
  completedJobs: integer("completed_jobs").notNull().default(0),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContractorVerificationSchema = createInsertSchema(contractorVerifications, {
  contractorId: z.string(),
  tier: z.enum(["bronze", "silver", "gold"]).optional(),
  hasInsurance: z.boolean().optional(),
  insuranceExpiry: z.date().optional(),
  hasLicense: z.boolean().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.date().optional(),
  backgroundCheck: z.boolean().optional(),
  bondAmount: z.number().optional(),
  completedJobs: z.number().optional(),
});

export type InsertContractorVerification = InferInsertModel<typeof contractorVerifications>;
export type ContractorVerification = InferSelectModel<typeof contractorVerifications>;

// AI Estimates table for photo-based pricing
export const aiEstimates = pgTable("ai_estimates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id"),
  photoUrl: text("photo_url"),
  treeType: text("tree_type"),
  estimatedHeight: real("estimated_height"),
  estimatedDiameter: real("estimated_diameter"),
  complexity: text("complexity"), // 'simple', 'moderate', 'complex', 'hazardous'
  priceMin: real("price_min"),
  priceMax: real("price_max"),
  confidence: real("confidence"),
  analysis: text("analysis"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiEstimateSchema = createInsertSchema(aiEstimates, {
  jobId: z.number().optional(),
  photoUrl: z.string().optional(),
  treeType: z.string().optional(),
  estimatedHeight: z.number().optional(),
  estimatedDiameter: z.number().optional(),
  complexity: z.enum(["simple", "moderate", "complex", "hazardous"]).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  confidence: z.number().optional(),
  analysis: z.string().optional(),
});

export type InsertAiEstimate = InferInsertModel<typeof aiEstimates>;
export type AiEstimate = InferSelectModel<typeof aiEstimates>;

// AR Telemetry table for Smart Glasses data
export const arTelemetry = pgTable("ar_telemetry", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  contractorId: varchar("contractor_id").notNull(),
  jobId: integer("job_id"),
  deviceType: text("device_type").notNull(), // 'hololens', 'nreal', 'mobile_ar'
  batteryLevel: real("battery_level"),
  gpsLat: real("gps_lat"),
  gpsLng: real("gps_lng"),
  heading: real("heading"),
  pitch: real("pitch"),
  roll: real("roll"),
  activeOverlays: text("active_overlays").array(), // e.g. ['hazard_map', 'pruning_guide']
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertArTelemetrySchema = createInsertSchema(arTelemetry, {
  contractorId: z.string(),
  jobId: z.number().optional(),
  deviceType: z.string(),
  batteryLevel: z.number().optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  heading: z.number().optional(),
  pitch: z.number().optional(),
  roll: z.number().optional(),
});

export type InsertArTelemetry = InferInsertModel<typeof arTelemetry>;
export type ArTelemetry = InferSelectModel<typeof arTelemetry>;
