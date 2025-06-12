// ===== 3. backend/src/routes/multipliers.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { multiplierTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(multiplierTransformation);

const createMultiplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  yearsExperience: z.number().min(0),
  certificationLevel: z.enum(["beginner", "intermediate", "expert"]), // ✅ VALEURS UI
  specialization: z.array(
    z.enum(["rice", "maize", "peanut", "sorghum", "cowpea", "millet"])
  ), // ✅ VALEURS UI
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive"]).optional(), // ✅ VALEURS UI
});

const updateMultiplierSchema = createMultiplierSchema.partial();

const contractSchema = z.object({
  varietyId: z.union([z.number().positive(), z.string()]),
  startDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  endDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  seedLevel: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]),
  expectedQuantity: z.number().positive(),
  parcelId: z.number().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).optional(), // ✅ VALEURS UI
});

// Routes...
router.get("/", MultiplierController.getMultipliers);
router.get("/:id", MultiplierController.getMultiplierById);
router.post(
  "/",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createMultiplierSchema }),
  MultiplierController.createMultiplier
);
router.put(
  "/:id",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateMultiplierSchema }),
  MultiplierController.updateMultiplier
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  MultiplierController.deleteMultiplier
);
router.get("/:id/contracts", MultiplierController.getContracts);
router.post(
  "/:id/contracts",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: contractSchema }),
  MultiplierController.createContract
);

export default router;
