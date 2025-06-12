// ===== 6. backend/src/routes/parcels.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { ParcelController } from "../controllers/ParcelController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { parcelTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(parcelTransformation);

const createParcelSchema = z.object({
  name: z.string().optional(),
  area: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.enum(["available", "in-use", "resting"]).optional(), // ✅ VALEURS UI
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

// Routes...
router.get("/", ParcelController.getParcels);
router.get("/:id", ParcelController.getParcelById);
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

export default router;
