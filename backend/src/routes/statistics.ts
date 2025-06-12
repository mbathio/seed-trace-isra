// ===== 10. backend/src/routes/statistics.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { StatisticsController } from "../controllers/StatisticsController";
import { authMiddleware, requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(fullTransformation);

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
