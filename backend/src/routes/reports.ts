// backend/src/routes/reports.ts - VERSION NETTOYÉE

import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";
import { ReportTypeEnum } from "../validators/common";

const router = Router();

const createReportSchema = z.object({
  title: z.string().min(1),
  type: ReportTypeEnum, // Enum Prisma direct
  description: z.string().optional(),
  parameters: z.any().optional(),
  data: z.any().optional(),
  isPublic: z.boolean().optional(),
});

// Routes
router.get("/", authMiddleware, ReportController.getReports);
router.get("/:id", authMiddleware, ReportController.getReportById);

router.post(
  "/",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createReportSchema }),
  ReportController.createReport
);

router.get("/production", authMiddleware, ReportController.getProductionReport);
router.get("/quality", authMiddleware, ReportController.getQualityReport);
router.get("/inventory", authMiddleware, ReportController.getInventoryReport);
router.get(
  "/multiplier-performance",
  authMiddleware,
  ReportController.getMultiplierPerformanceReport
);

export default router;
