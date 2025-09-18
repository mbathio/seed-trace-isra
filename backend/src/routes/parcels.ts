// backend/src/routes/parcels.ts - VERSION NETTOYÉE

import { Router } from "express";
import { ParcelController } from "../controllers/ParcelController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";
import { ParcelStatusEnum } from "../validators/common";

const router = Router();

const createParcelSchema = z.object({
  name: z.string().optional(),
  area: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  status: ParcelStatusEnum.optional(), // Enum Prisma direct
  soilType: z.string().optional(),
  irrigationSystem: z.string().optional(),
  address: z.string().optional(),
  multiplierId: z.number().optional(),
});

const updateParcelSchema = createParcelSchema.partial();

const soilAnalysisSchema = z.object({
  analysisDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  pH: z.number().optional(),
  organicMatter: z.number().optional(),
  nitrogen: z.number().optional(),
  phosphorus: z.number().optional(),
  potassium: z.number().optional(),
  notes: z.string().optional(),
});

// Routes publiques
router.get("/", ParcelController.getParcels);
router.get("/statistics", ParcelController.getStatistics);
router.get("/:id", ParcelController.getParcelById);
router.get("/:id/soil-analyses", ParcelController.getSoilAnalyses);
router.get("/:id/history", ParcelController.getHistory);

// Routes protégées
router.post(
  "/",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createParcelSchema }),
  ParcelController.createParcel
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateParcelSchema }),
  ParcelController.updateParcel
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  ParcelController.deleteParcel
);

router.post(
  "/:id/soil-analysis",
  authMiddleware,
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: soilAnalysisSchema }),
  ParcelController.addSoilAnalysis
);

export default router;
