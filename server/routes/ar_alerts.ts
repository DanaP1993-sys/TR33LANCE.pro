import { Router } from "express";

const router = Router();

// Logs or triggers AI notifications from Smart Glasses
router.post("/alert", (req, res) => {
  const { contractorId, type, message } = req.body;
  console.log(`[AR-AI-ALERT] contractor: ${contractorId}, type: ${type}, message: ${message}`);
  res.json({ status: "ok" });
});

export default router;
