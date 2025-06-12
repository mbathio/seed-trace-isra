// ===== 8. backend/src/routes/reports.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(fullTransformation);

const createReportSchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    "production",
    "quality",
    "inventory",
    "multiplier-performance",
    "custom",
  ]), // ✅ VALEURS UI
  description: z.string().optional(),
  parameters: z.any().optional(),
  data: z.any().optional(),
  isPublic: z.boolean().optional(),
});

// Routes...
router.get("/", ReportController.getReports);
router.get("/:id", ReportController.getReportById);
router.post(
  "/",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createReportSchema }),
  ReportController.createReport
);
router.get("/production", ReportController.getProductionReport);
router.get("/quality", ReportController.getQualityReport);
router.get("/inventory", ReportController.getInventoryReport);
router.get(
  "/multiplier-performance",
  ReportController.getMultiplierPerformanceReport
);

export default router;
