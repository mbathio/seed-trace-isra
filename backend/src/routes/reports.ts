// backend/src/routes/reports.ts
import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createReportSchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    "production",
    "quality",
    "inventory",
    "multiplier_performance",
    "custom",
  ]),
  description: z.string().optional(),
  parameters: z.any().optional(),
  data: z.any().optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/reports
router.get("/", ReportController.getReports);

// GET /api/reports/:id
router.get("/:id", ReportController.getReportById);

// POST /api/reports
router.post(
  "/",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createReportSchema }),
  ReportController.createReport
);

// GET /api/reports/production
router.get("/production", ReportController.getProductionReport);

// GET /api/reports/quality
router.get("/quality", ReportController.getQualityReport);

// GET /api/reports/inventory
router.get("/inventory", ReportController.getInventoryReport);

// GET /api/reports/multiplier-performance
router.get(
  "/multiplier-performance",
  ReportController.getMultiplierPerformanceReport
);

export default router;
