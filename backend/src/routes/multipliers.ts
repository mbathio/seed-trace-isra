// ===== backend/src/routes/multipliers.ts - VERSION SIMPLIFIÉE =====
import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
// ❌ SUPPRIMÉ: import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";
import {
  MultiplierStatusEnum,
  CertificationLevelEnum,
  CropTypeEnum,
  SeedLevelEnum,
  ContractStatusEnum,
} from "../validators/common";

const router = Router();

// ✅ CORRECTION: Plus de middleware de transformation
// router.use(fullTransformation); // ❌ SUPPRIMÉ

// Schémas de validation avec enums Prisma
const createMultiplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  yearsExperience: z.number().min(0),
  certificationLevel: CertificationLevelEnum, // ✅ Enum Prisma direct
  specialization: z.array(CropTypeEnum), // ✅ Enum Prisma direct
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: MultiplierStatusEnum.optional(), // ✅ Enum Prisma direct
});

const updateMultiplierSchema = createMultiplierSchema.partial();

const contractSchema = z.object({
  varietyId: z.union([z.number().positive(), z.string()]),
  startDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  endDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  seedLevel: SeedLevelEnum, // ✅ Enum Prisma direct
  expectedQuantity: z.number().positive(),
  parcelId: z.number().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  status: ContractStatusEnum.optional(), // ✅ Enum Prisma direct
});

// Routes (inchangées)
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
