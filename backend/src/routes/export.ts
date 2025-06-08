import { Router } from "express";
import { ExportController } from "../controllers/ExportController";
import { requireRole } from "../middleware/auth";

const router = Router();

// GET /api/export/seed-lots?format=csv&level=G1&status=certified
router.get(
  "/seed-lots",
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  ExportController.exportSeedLots
);

// GET /api/export/quality-report?format=html&startDate=2024-01-01
router.get(
  "/quality-report",
  requireRole("MANAGER", "ADMIN", "INSPECTOR"),
  ExportController.exportQualityReport
);

export default router;
