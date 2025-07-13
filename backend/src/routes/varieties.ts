// backend/src/routes/varieties.ts - VERSION CORRIGÉE
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ IMPORTANT: Appliquer le middleware de transformation
router.use(fullTransformation);

const createVarietySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  cropType: z
    .enum([
      // Accepter les valeurs UI
      "rice",
      "maize",
      "peanut",
      "sorghum",
      "cowpea",
      "millet",
      "wheat",
      // Et les valeurs DB (au cas où)
      "RICE",
      "MAIZE",
      "PEANUT",
      "SORGHUM",
      "COWPEA",
      "MILLET",
      "WHEAT",
    ])
    .transform((val) => {
      // Toujours retourner en majuscules pour la DB
      return val.toUpperCase();
    }),
  description: z.string().optional(),
  maturityDays: z.number().positive(),
  yieldPotential: z.number().positive().optional(),
  resistances: z.array(z.string()).optional(),
  origin: z.string().optional(),
  releaseYear: z.number().optional(),
});

const updateVarietySchema = createVarietySchema.partial().omit({ code: true });

// Routes
router.get("/", VarietyController.getVarieties);
router.get("/:id", VarietyController.getVarietyById);

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
