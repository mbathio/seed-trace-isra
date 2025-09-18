// backend/src/routes/statistics.ts - VERSION NETTOYÉE

import { Router } from "express";
import { StatisticsController } from "../controllers/StatisticsController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getDashboardStats
);

router.get(
  "/trends",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getMonthlyTrends
);

export default router;
