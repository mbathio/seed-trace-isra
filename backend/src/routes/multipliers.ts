import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const toUpperCaseEnum = (values: readonly string[]) =>
  z
    .string()
    .min(1)
    .transform((val) => val.trim())
    .transform((val) => val.toUpperCase())
    .refine((val) => values.includes(val), {
      message: `Valeur invalide. Options autorisées: ${values.join(", ")}`,
    });

const toLowerCaseEnum = (values: readonly string[]) =>
  z
    .string()
    .min(1)
    .transform((val) => val.trim())
    .transform((val) => val.toLowerCase())
    .refine((val) => values.includes(val), {
      message: `Valeur invalide. Options autorisées: ${values.join(", ")}`,
    });

const router = Router();

// ✅ Appliquer le middleware de transformation
router.use(fullTransformation);

// Schémas de validation avec valeurs UI
const createMultiplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  yearsExperience: z.number().min(0),
  certificationLevel: toUpperCaseEnum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
  specialization: z.array(
    toLowerCaseEnum([
      "rice",
      "maize",
      "peanut",
      "sorghum",
      "cowpea",
      "millet",
      "wheat",
    ])
  ),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: toUpperCaseEnum(["ACTIVE", "INACTIVE"]).optional(),
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
  validateRequest({ body: createMultiplierSchema }),
  MultiplierController.createMultiplier
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
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
