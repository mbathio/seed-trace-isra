import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ Appliquer le middleware de transformation

// Schémas de validation avec valeurs UI
const createMultiplierSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  latitude: z.number(),
  longitude: z.number(),
  yearsExperience: z.number().min(0, "Expérience invalide"),
  certificationLevel: z.enum([
    "beginner",
    "intermediate",
    "expert",
    "BEGINNER",
    "INTERMEDIATE",
    "EXPERT",
  ]), // ✅ accepte les deux formats
  specialization: z.array(
    z.enum(["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"])
  ),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z
    .enum(["active", "inactive", "ACTIVE", "INACTIVE"])
    .default("active"), // ✅ accepte aussi les deux
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
  status: z.enum(["draft", "active", "completed", "cancelled"]).optional(), // Valeurs UI
});

// Routes
router.get("/", MultiplierController.getMultipliers);
router.get("/:id", MultiplierController.getMultiplierById);
router.post(
  "/",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  fullTransformation,
  validateRequest({ body: createMultiplierSchema }),
  MultiplierController.createMultiplier
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  fullTransformation,
  validateRequest({ body: updateMultiplierSchema }),
  MultiplierController.updateMultiplier
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  MultiplierController.deleteMultiplier
);
router.get("/:id/contracts", MultiplierController.getContracts);
router.post(
  "/:id/contracts",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: contractSchema }),
  MultiplierController.createContract
);

export default router;
