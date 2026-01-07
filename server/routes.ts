import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertContractorSchema, insertDisputeSchema, insertNotificationSchema, insertDirectMessageSchema, insertDroneSurveySchema, insertTreeSensorSchema, insertSensorReadingSchema, insertJobPhotoSchema, insertContractorVerificationSchema, insertAiEstimateSchema } from "@shared/schema";
import { hashPassword, comparePassword, createToken } from "./auth";
import { requireAuth } from "./middleware/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { registerChatRoutes } from "./replit_integrations/chat";
import { broadcastJobUpdate, broadcastToUser } from "./websocket";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import { estimateJob, estimateFromDescription } from "./aiEstimator";
import { uploadJobPhoto, validateJobDocumentation, getJobPhotosPath } from "./jobDocs";
import { verifyContractor, getPayoutRate, getAllTierBenefits } from "./contractorVerification";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxFileSize = 10 * 1024 * 1024; // 10MB

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        role: role || "homeowner",
        password: await hashPassword(password)
      });

      res.json({ token: createToken(user) });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ token: createToken(user) });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const parsed = insertJobSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const job = await storage.createJob(parsed.data);
      broadcastJobUpdate(job.id, { action: 'created', job });
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", requireAuth("contractor"), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
      const job = await storage.updateJob(id, {
        contractorId: req.user.id,
        status: "accepted"
      });
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      broadcastJobUpdate(id, { action: 'accepted', job });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  // Update job status (any valid status)
  app.patch("/api/jobs/:id/status", requireAuth(), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const validStatuses = ["requested", "accepted", "in_progress", "completed", "cancelled"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const job = await storage.updateJob(id, { status });
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      broadcastJobUpdate(id, { action: 'status_changed', status, job });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job status" });
    }
  });

  // Get active jobs (not completed/cancelled)
  app.get("/api/jobs/active", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      const active = jobs.filter(j => !["completed", "cancelled"].includes(j.status));
      res.json(active);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active jobs" });
    }
  });

  // Contractors API
  app.get("/api/contractors", async (req, res) => {
    try {
      const contractors = await storage.getContractors();
      res.json(contractors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contractors" });
    }
  });

  // Get nearby contractors within radius (default 10km)
  app.get("/api/contractors/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 10;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "lat and lng query params required" });
      }

      const contractors = await storage.getContractors();
      
      // Haversine formula for distance calculation
      const toRad = (deg: number) => deg * Math.PI / 180;
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const nearby = contractors
        .filter(c => c.lat && c.lng)
        .map(c => ({
          ...c,
          distance: getDistance(lat, lng, c.lat!, c.lng!)
        }))
        .filter(c => c.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      res.json(nearby);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nearby contractors" });
    }
  });

  app.post("/api/contractors", async (req, res) => {
    try {
      const parsed = insertContractorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const contractor = await storage.createContractor(parsed.data);
      res.status(201).json(contractor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create contractor" });
    }
  });

  // Payout calculation
  app.post("/api/payout", async (req, res) => {
    try {
      const { jobId, price } = req.body;
      
      if (!price || typeof price !== 'number') {
        return res.status(400).json({ error: "Price is required" });
      }

      const platformFee = Math.round(price * 0.2 * 100) / 100;
      const contractorPayout = Math.round(price * 0.8 * 100) / 100;

      res.json({
        jobId,
        total: price,
        platformFee,
        contractorPayout
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate payout" });
    }
  });

  // Stripe publishable key for frontend
  app.get("/api/stripe/key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  // Create checkout session for job payment
  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      const { jobId, amount, contractorStripeId } = req.body;

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: "Amount is required" });
      }

      const stripe = await getUncachableStripeClient();
      const amountCents = Math.round(amount * 100);
      const platformFeeCents = Math.round(amountCents * 0.2);

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tree Service Job #${jobId || 'N/A'}`,
              description: 'Tree-Lance job payment'
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
        metadata: {
          jobId: jobId?.toString() || '',
          contractorStripeId: contractorStripeId || '',
          platformFee: platformFeeCents.toString(),
        }
      });

      res.json({ 
        sessionId: session.id, 
        url: session.url,
        platformFee: platformFeeCents / 100,
        contractorPayout: (amountCents - platformFeeCents) / 100
      });
    } catch (error: any) {
      console.error('Stripe checkout error:', error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Smart Dispatch API - finds best contractor by distance + rating
  app.post("/api/dispatch", async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng required" });
      }

      const contractors = await storage.getContractors();
      
      const toRad = (deg: number) => deg * Math.PI / 180;
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const nearby = contractors
        .filter(c => c.lat && c.lng)
        .map(c => ({
          ...c,
          distance: getDistance(lat, lng, c.lat!, c.lng!),
          score: (c.rating / 5) * 0.4 + (1 - Math.min(getDistance(lat, lng, c.lat!, c.lng!) / radius, 1)) * 0.6
        }))
        .filter(c => c.distance <= radius)
        .sort((a, b) => b.score - a.score);

      if (nearby.length === 0) {
        return res.json({ contractor: null, message: "No contractors available in area" });
      }

      res.json({ 
        contractor: nearby[0],
        alternatives: nearby.slice(1, 4)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to dispatch" });
    }
  });

  // Profile API
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      const averageRating = user.ratings && user.ratings.length > 0
        ? user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length
        : 0;
      res.json({ ...safeUser, averageRating });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", requireAuth(), async (req: any, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const { name, verified } = req.body;
      const user = await storage.updateUser(req.params.id, { name, verified });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/users/:id/ratings", requireAuth(), async (req: any, res) => {
    try {
      const { rating } = req.body;
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      const user = await storage.addRating(req.params.id, rating);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const averageRating = user.ratings && user.ratings.length > 0
        ? user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length
        : 0;
      res.json({ averageRating, totalRatings: user.ratings?.length || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to add rating" });
    }
  });

  // Verification API
  app.post("/api/users/:id/verify", requireAuth(), async (req: any, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { verified: true });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ verified: true, userId: user.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify user" });
    }
  });

  // Disputes API
  app.get("/api/disputes", requireAuth(), async (req: any, res) => {
    try {
      const allDisputes = await storage.getDisputes();
      res.json(allDisputes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disputes" });
    }
  });

  app.post("/api/disputes", requireAuth(), async (req: any, res) => {
    try {
      const parsed = insertDisputeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const dispute = await storage.createDispute(parsed.data);
      res.status(201).json(dispute);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dispute" });
    }
  });

  app.patch("/api/disputes/:id", requireAuth(), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const validStatuses = ["open", "resolved", "rejected"];
      
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const dispute = await storage.updateDispute(id, { status });
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      res.json(dispute);
    } catch (error) {
      res.status(500).json({ error: "Failed to update dispute" });
    }
  });

  // Notifications API
  app.get("/api/notifications", requireAuth(), async (req: any, res) => {
    try {
      const userNotifications = await storage.getNotifications(req.user.id);
      res.json(userNotifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", requireAuth(), async (req: any, res) => {
    try {
      const parsed = insertNotificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const notification = await storage.createNotification(parsed.data);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth(), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationRead(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  // Seed contractors if none exist
  app.post("/api/seed", async (req, res) => {
    try {
      const existing = await storage.getContractors();
      if (existing.length === 0) {
        await storage.createContractor({ name: "Green Leaf Crew", rating: 4.8, lat: 29.75, lng: -95.37, stripeId: "acct_1" });
        await storage.createContractor({ name: "Texas Tree Pros", rating: 4.9, lat: 29.77, lng: -95.34, stripeId: "acct_2" });
        await storage.createContractor({ name: "Arbor Experts", rating: 4.7, lat: 29.73, lng: -95.40, stripeId: "acct_3" });
      }
      res.json({ message: "Seed complete" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  // Register AI chat routes from integration
  registerChatRoutes(app);

  // Direct Messaging API
  app.get("/api/messages/conversations", requireAuth(), async (req: any, res) => {
    try {
      const conversations = await storage.getConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:userId", requireAuth(), async (req: any, res) => {
    try {
      const messages = await storage.getDirectMessages(req.user.id, req.params.userId);
      await storage.markConversationRead(req.user.id, req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", requireAuth(), async (req: any, res) => {
    try {
      const parsed = insertDirectMessageSchema.safeParse({
        ...req.body,
        senderId: req.user.id
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const message = await storage.sendDirectMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", requireAuth(), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markDirectMessageRead(id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message read" });
    }
  });

  // AI Completion endpoint - Returns OpenAI-compatible format for Flutter
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, model = "gpt-4o-mini" } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 2048,
      });

      res.json(completion);
    } catch (error: any) {
      console.error("AI chat error:", error.message);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // AI Job Analysis - Parses job descriptions and estimates
  app.post("/api/ai/analyze-job", async (req, res) => {
    try {
      const { description, location } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a tree service pricing AI. Analyze tree service job descriptions and provide estimates. Return JSON with: title (short job title), estimatedPrice (number in USD), riskLevel (low/medium/high), estimatedHours (number), requiredEquipment (array of strings).`
          },
          {
            role: "user",
            content: `Analyze this tree service job: ${description}${location ? ` Location: ${location}` : ''}`
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(analysis);
    } catch (error: any) {
      console.error("Job analysis error:", error.message);
      res.status(500).json({ error: "Failed to analyze job" });
    }
  });

  // Drone Surveys API
  app.get("/api/drones", async (req, res) => {
    try {
      const surveys = await storage.getDroneSurveys();
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drone surveys" });
    }
  });

  app.get("/api/drones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const survey = await storage.getDroneSurvey(id);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  app.post("/api/drones", async (req, res) => {
    try {
      const parsed = insertDroneSurveySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const survey = await storage.createDroneSurvey(parsed.data);
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to create drone survey" });
    }
  });

  app.patch("/api/drones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const survey = await storage.updateDroneSurvey(id, req.body);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to update survey" });
    }
  });

  // Tree Sensors API
  app.get("/api/sensors", async (req, res) => {
    try {
      const sensors = await storage.getTreeSensors();
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensors" });
    }
  });

  app.get("/api/sensors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sensor = await storage.getTreeSensor(id);
      if (!sensor) {
        return res.status(404).json({ error: "Sensor not found" });
      }
      res.json(sensor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor" });
    }
  });

  app.post("/api/sensors", async (req, res) => {
    try {
      const parsed = insertTreeSensorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const sensor = await storage.createTreeSensor(parsed.data);
      res.status(201).json(sensor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sensor" });
    }
  });

  app.patch("/api/sensors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sensor = await storage.updateTreeSensor(id, req.body);
      if (!sensor) {
        return res.status(404).json({ error: "Sensor not found" });
      }
      res.json(sensor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sensor" });
    }
  });

  // Sensor Readings API
  app.get("/api/sensors/:id/readings", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const readings = await storage.getSensorReadings(id);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch readings" });
    }
  });

  app.post("/api/sensors/:id/readings", async (req, res) => {
    try {
      const sensorId = parseInt(req.params.id);
      const parsed = insertSensorReadingSchema.safeParse({ ...req.body, sensorId });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const reading = await storage.createSensorReading(parsed.data);
      
      // Update sensor's last reading and current values
      await storage.updateTreeSensor(sensorId, {
        lastReading: new Date(),
        soilMoisture: parsed.data.soilMoisture,
        structuralHealth: parsed.data.structuralHealth,
        leafHealth: parsed.data.leafHealth,
        temperature: parsed.data.temperature,
        humidity: parsed.data.humidity,
      });
      
      res.status(201).json(reading);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reading" });
    }
  });

  // Seed IoT demo data
  app.post("/api/seed-iot", async (req, res) => {
    try {
      const existingSensors = await storage.getTreeSensors();
      const existingSurveys = await storage.getDroneSurveys();
      
      if (existingSensors.length === 0) {
        await storage.createTreeSensor({
          treeId: "OAK-001",
          name: "Heritage Oak - Front Yard",
          lat: 29.7604,
          lng: -95.3698,
          species: "Live Oak",
          soilMoisture: 72,
          structuralHealth: 95,
          leafHealth: 88,
          temperature: 78,
          humidity: 65,
          batteryLevel: 94
        });
        await storage.createTreeSensor({
          treeId: "PINE-002",
          name: "Loblolly Pine - Backyard",
          lat: 29.7610,
          lng: -95.3705,
          species: "Loblolly Pine",
          soilMoisture: 58,
          structuralHealth: 82,
          leafHealth: 91,
          temperature: 76,
          humidity: 62,
          batteryLevel: 87
        });
        await storage.createTreeSensor({
          treeId: "MAPLE-003",
          name: "Red Maple - Side Yard",
          lat: 29.7598,
          lng: -95.3692,
          species: "Red Maple",
          soilMoisture: 45,
          structuralHealth: 78,
          leafHealth: 72,
          temperature: 79,
          humidity: 58,
          batteryLevel: 23,
          status: "warning"
        });
      }
      
      if (existingSurveys.length === 0) {
        await storage.createDroneSurvey({
          lat: 29.7604,
          lng: -95.3698,
          altitude: 50,
          status: "completed",
          imageCount: 127,
          areaSquareMeters: 2500,
          findings: "Identified 3 mature trees, 1 with potential crown dieback. Recommended inspection for OAK-001."
        });
        await storage.createDroneSurvey({
          lat: 29.7650,
          lng: -95.3720,
          altitude: 75,
          status: "scheduled",
          areaSquareMeters: 4800
        });
      }
      
      res.json({ message: "IoT demo data seeded" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed IoT data" });
    }
  });

  // AI Job Estimation - Photo-based
  app.post("/api/job-estimate", upload.single("treePhoto"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Tree photo is required" });
      }
      const description = req.body.description;
      
      // Keep file for storage, analyze first
      const result = await estimateJob(req.file.path, description, true);
      
      // Move file to permanent location with proper name
      const fs = require("fs");
      const timestamp = Date.now();
      const ext = path.extname(req.file.originalname) || ".jpg";
      const newFilename = `estimate_${timestamp}${ext}`;
      const newPath = path.join("uploads", newFilename);
      fs.renameSync(req.file.path, newPath);
      const photoUrl = `/uploads/${newFilename}`;
      
      // Save estimate to database
      const estimate = await storage.createAiEstimate({
        jobId: req.body.jobId ? parseInt(req.body.jobId) : undefined,
        photoUrl,
        treeType: result.treeType,
        estimatedHeight: result.estimatedHeight,
        estimatedDiameter: result.estimatedDiameter,
        complexity: result.complexity,
        priceMin: result.priceMin,
        priceMax: result.priceMax,
        confidence: result.confidence,
        analysis: result.analysis,
      });

      res.json({ 
        success: true, 
        estimate: {
          ...result,
          id: estimate.id,
          photoUrl,
        }
      });
    } catch (error: any) {
      console.error("Estimation error:", error.message);
      res.status(500).json({ success: false, error: "Estimation failed" });
    }
  });

  // AI Job Estimation - Text-based
  app.post("/api/job-estimate/text", async (req, res) => {
    try {
      const { description, jobId } = req.body;
      if (!description) {
        return res.status(400).json({ success: false, error: "Description is required" });
      }
      
      const result = await estimateFromDescription(description);
      
      const estimate = await storage.createAiEstimate({
        jobId: jobId ? parseInt(jobId) : undefined,
        treeType: result.treeType,
        estimatedHeight: result.estimatedHeight,
        estimatedDiameter: result.estimatedDiameter,
        complexity: result.complexity,
        priceMin: result.priceMin,
        priceMax: result.priceMax,
        confidence: result.confidence,
        analysis: result.analysis,
      });

      res.json({ 
        success: true, 
        estimate: {
          ...result,
          id: estimate.id,
        }
      });
    } catch (error: any) {
      console.error("Estimation error:", error.message);
      res.status(500).json({ success: false, error: "Estimation failed" });
    }
  });

  // Stripe Payment - Create payment intent with escrow-style split
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { amount, contractorId, jobId } = req.body;
      
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ success: false, error: "Amount is required" });
      }

      const stripe = await getUncachableStripeClient();
      const amountCents = Math.round(amount * 100);
      
      // Get contractor tier for payout rate
      let payoutRate = 0.80; // Default bronze rate
      if (contractorId) {
        const verification = await storage.getContractorVerification(contractorId);
        if (verification) {
          payoutRate = getPayoutRate(verification.tier as any);
        }
      }
      
      const platformFeeCents = Math.round(amountCents * (1 - payoutRate));
      const contractorAmountCents = amountCents - platformFeeCents;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          jobId: jobId?.toString() || '',
          contractorId: contractorId || '',
          platformFee: platformFeeCents.toString(),
          contractorPayout: contractorAmountCents.toString(),
        }
      });

      res.json({ 
        success: true, 
        clientSecret: paymentIntent.client_secret,
        platformFee: platformFeeCents / 100,
        contractorPayout: contractorAmountCents / 100,
        payoutRate
      });
    } catch (error: any) {
      console.error("Payment error:", error.message);
      res.status(500).json({ success: false, error: "Payment creation failed" });
    }
  });

  // Upload Job Photos (before/after documentation) - requires auth
  app.post("/api/upload-photo", requireAuth(), upload.single("jobPhoto"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Photo is required" });
      }

      const { jobId, type, latitude, longitude } = req.body;
      
      if (!jobId || !type) {
        return res.status(400).json({ success: false, error: "jobId and type are required" });
      }

      const validTypes = ["before", "after", "estimate"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, error: "Type must be 'before', 'after', or 'estimate'" });
      }

      const location = latitude && longitude 
        ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
        : undefined;

      const result = await uploadJobPhoto(req.file.path, parseInt(jobId), type, location);
      
      // Save to database
      const photo = await storage.createJobPhoto({
        jobId: parseInt(jobId),
        type: type as "before" | "after" | "estimate",
        url: result.url,
        lat: location?.lat,
        lng: location?.lng,
        verified: result.verified,
      });

      res.json({ 
        success: true, 
        photo: {
          id: photo.id,
          url: result.url,
          type: result.type,
          verified: result.verified,
          timestamp: result.timestamp,
        }
      });
    } catch (error: any) {
      console.error("Photo upload error:", error.message);
      res.status(500).json({ success: false, error: "Photo upload failed" });
    }
  });

  // Get job photos
  app.get("/api/jobs/:id/photos", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const photos = await storage.getJobPhotos(jobId);
      const validation = validateJobDocumentation(photos);
      
      res.json({
        photos,
        documentation: validation,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job photos" });
    }
  });

  // Contractor Verification
  app.post("/api/verify-contractor", async (req, res) => {
    try {
      const { 
        contractorId,
        hasInsurance,
        insuranceExpiry,
        hasLicense,
        licenseNumber,
        licenseExpiry,
        backgroundCheck,
        bondAmount,
        completedJobs
      } = req.body;

      if (!contractorId) {
        return res.status(400).json({ success: false, error: "contractorId is required" });
      }

      const verificationData = {
        hasInsurance: !!hasInsurance,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
        hasLicense: !!hasLicense,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        backgroundCheck: !!backgroundCheck,
        bondAmount: bondAmount ? parseFloat(bondAmount) : undefined,
        completedJobs: completedJobs ? parseInt(completedJobs) : 0,
      };

      const result = verifyContractor(verificationData);

      // Save or update verification in database
      const existing = await storage.getContractorVerification(contractorId);
      
      if (existing) {
        await storage.updateContractorVerification(contractorId, {
          tier: result.tier,
          hasInsurance: verificationData.hasInsurance,
          insuranceExpiry: verificationData.insuranceExpiry,
          hasLicense: verificationData.hasLicense,
          licenseNumber: verificationData.licenseNumber,
          licenseExpiry: verificationData.licenseExpiry,
          backgroundCheck: verificationData.backgroundCheck,
          bondAmount: verificationData.bondAmount,
          completedJobs: verificationData.completedJobs,
          verifiedAt: result.verified ? new Date() : null,
        });
      } else {
        await storage.createContractorVerification({
          contractorId,
          tier: result.tier,
          hasInsurance: verificationData.hasInsurance,
          hasLicense: verificationData.hasLicense,
          licenseNumber: verificationData.licenseNumber,
          backgroundCheck: verificationData.backgroundCheck,
          bondAmount: verificationData.bondAmount,
          completedJobs: verificationData.completedJobs,
        });
      }

      res.json({ 
        success: true, 
        verified: result.verified,
        tier: result.tier,
        score: result.score,
        requirements: result.requirements,
        benefits: result.benefits,
        payoutRate: getPayoutRate(result.tier),
      });
    } catch (error: any) {
      console.error("Verification error:", error.message);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  // Get contractor verification status
  app.get("/api/contractors/:id/verification", async (req, res) => {
    try {
      const verification = await storage.getContractorVerification(req.params.id);
      if (!verification) {
        return res.json({ 
          verified: false, 
          tier: "bronze",
          benefits: getAllTierBenefits().bronze,
          payoutRate: 0.80,
        });
      }
      
      res.json({
        ...verification,
        payoutRate: getPayoutRate(verification.tier as any),
        benefits: getAllTierBenefits()[verification.tier as keyof ReturnType<typeof getAllTierBenefits>],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification" });
    }
  });

  // Get tier benefits overview
  app.get("/api/contractor-tiers", (req, res) => {
    res.json({
      tiers: getAllTierBenefits(),
      payoutRates: {
        bronze: 0.80,
        silver: 0.85,
        gold: 0.90,
      }
    });
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  return httpServer;
}
