import { Router } from "express";
import { StatisticsController } from "../controllers/StatisticsController";
import { authMiddleware, requireRole } from "../middleware/auth"; // ✅ Import authMiddleware

const router = Router();

// ✅ CORRECTION: Ajouter authMiddleware avant requireRole
router.get(
  "/dashboard",
  authMiddleware, // ✅ AJOUTÉ: Middleware d'authentification
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getDashboardStats
);

// ✅ CORRECTION: Ajouter authMiddleware avant requireRole
router.get(
  "/trends",
  authMiddleware, // ✅ AJOUTÉ: Middleware d'authentification
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  StatisticsController.getMonthlyTrends
);

export default router;
