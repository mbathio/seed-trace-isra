// backend/src/routes/varieties.ts - VERSION NETTOYÉE

import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";
import { CropTypeEnum } from "../validators/common";

const router = Router();

// Schema de création avec enums Prisma directs
const createVarietySchema = z.object({
  code: z.string().min(1).toUpperCase(),
  name: z.string().min(1),
  cropType: CropTypeEnum, // Enum Prisma direct
  description: z.string().optional(),
  maturityDays: z.number().positive(),
  yieldPotential: z.number().positive().optional(),
  resistances: z.array(z.string()).optional(),
  origin: z.string().optional(),
  releaseYear: z.number().optional(),
});

const updateVarietySchema = createVarietySchema.partial().omit({ code: true });

// Routes publiques
router.get("/", VarietyController.getVarieties);
router.get("/:id", VarietyController.getVarietyById);

// Routes protégées
router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: createVarietySchema }),
  VarietyController.createVariety
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: updateVarietySchema }),
  VarietyController.updateVariety
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  VarietyController.deleteVariety
);

export default router;
