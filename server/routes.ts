import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertContractorSchema } from "@shared/schema";
import { hashPassword, comparePassword, createToken } from "./auth";
import { requireAuth } from "./middleware/auth";

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
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
      const job = await storage.updateJob(id, req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
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

  return httpServer;
}
