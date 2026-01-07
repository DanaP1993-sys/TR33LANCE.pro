import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "dist/index.js",
    banner: { js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);` },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

│  ├─ App.vue
│  └─ components/
├─ server/          # Backend
│  ├─ index.ts      # Express entry point
│  ├─ services/     # Business logic (JobService, PaymentService, AIService)
│  ├─ models/       # Data models (Job, Contractor, Homeowner)
│  ├─ utils/        # Utilities (db, logger, errorHandler)
│  └─ routes/       # Express routes (jobs, payments, profiles, auth)
├─ shared/          # Shared types & constants
│  ├─ types.ts
│  └─ constants.ts
├─ dist/            # Build output (Vite + bundled server)
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ build.js         # Integrated build script (Vite + esbuild)
└─ README.md
npm install drizzle-orm drizzle-kit pg zod
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Use environment variables for credentials
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tree_lance",
});

export const db = drizzle(pool); import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Use environment variables for credentials
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tree_lance",
});

export const db = drizzle(pool); import { db } from "../utils/db";
import { jobs } from "../models/Job";

export class JobService {
  async createJob(data: {
    homeownerId: string;
    description: string;
    latitude: number;
    longitude: number;
    price: number;
  }) {
    const result = await db.insert(jobs).values(data).returning();
    return result[0];
  }

  async listJobs() {
    return db.select().from(jobs);
  }

  async findJob(id: number) {
    return db.select().from(jobs).where(jobs.id.eq(id)).get();
  }

  async updateJobStatus(id: number, status: string) {
    await db.update(jobs).set({ status }).where(jobs.id.eq(id));
    return this.findJob(id);
  }
} import express from "express";
import { z } from "zod";
import { JobService } from "../services/JobService";

const router = express.Router();
const jobService = new JobService();

const createJobSchema = z.object({
  homeownerId: z.string().uuid(),
  description: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number().min(1),
});

const updateJobStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["requested", "accepted", "in_progress", "completed", "cancelled"]),
});

// Create a job
router.post("/", async (req, res) => {
  try {
    const data = createJobSchema.parse(req.body);
    const job = await jobService.createJob(data);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

// List all jobs
router.get("/", async (_req, res) => {
  const jobs = await jobService.listJobs();
  res.json(jobs);
});

// Update job status
router.patch("/status", async (req, res) => {
  try {
    const { id, status } = updateJobStatusSchema.parse(req.body);
    const job = await jobService.updateJobStatus(id, status);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

export default router; import express from "express";
import cors from "cors";
import jobRoutes from "./routes/jobs";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/jobs", jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>"console.log(`Server running on port ${PORT}`));