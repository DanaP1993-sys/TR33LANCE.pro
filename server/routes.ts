import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertContractorSchema } from "@shared/schema";
import { hashPassword, comparePassword, createToken } from "./auth";
import { requireAuth } from "./middleware/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

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
