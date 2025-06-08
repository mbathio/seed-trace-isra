import { Router } from "express";
import { StatisticsController } from "../controllers/StatisticsController";
import { requireRole } from "../middleware/auth";

const router = Router();

// GET /api/statistics/dashboard
router.get(
  "/dashboard",
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getDashboardStats
);

// GET /api/statistics/trends?months=6
router.get(
  "/trends",
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getMonthlyTrends
);

export default router;
