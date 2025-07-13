// backend/src/routes/parcels.ts - VERSION COMPLÈTE AVEC TOUTES LES ROUTES
import { Router } from "express";
import { ParcelController } from "../controllers/ParcelController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(fullTransformation);

const createParcelSchema = z.object({
  name: z.string().optional(),
  area: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.enum(["available", "in-use", "resting"]).optional(),
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

const checkAvailabilitySchema = z.object({
  startDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  endDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
});

const assignMultiplierSchema = z.object({
  multiplierId: z.number().positive(),
});

// Routes publiques (avec authentification mais sans restriction de rôle)
router.get("/", ParcelController.getParcels);
router.get("/statistics", ParcelController.getStatistics);
router.get(
  "/export",
  requireRole("MANAGER", "ADMIN"),
  ParcelController.exportParcels
);
router.get("/:id", ParcelController.getParcelById);
router.get("/:id/soil-analyses", ParcelController.getSoilAnalyses);
router.get("/:id/history", ParcelController.getHistory);

// Routes protégées
router.post(
  "/",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createParcelSchema }),
  ParcelController.createParcel
);

router.put(
  "/:id",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateParcelSchema }),
  ParcelController.updateParcel
);

router.delete("/:id", requireRole("ADMIN"), ParcelController.deleteParcel);

router.post(
  "/:id/soil-analysis",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: soilAnalysisSchema }),
  ParcelController.addSoilAnalysis
);

router.post(
  "/:id/check-availability",
  validateRequest({ body: checkAvailabilitySchema }),
  ParcelController.checkAvailability
);

router.post(
  "/:id/assign-multiplier",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: assignMultiplierSchema }),
  ParcelController.assignMultiplier
);

export default router;
