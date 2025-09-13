// backend/src/routes/varieties.ts - VERSION CORRIGÉE
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Schema de création avec transformation automatique
const createVarietySchema = z.object({
  code: z.string().min(1).toUpperCase(), // Transformer en majuscules
  name: z.string().min(1),
  cropType: z
    .string()
    .transform((val) => {
      // Accepter les deux formats et transformer en format DB
      const mapping: Record<string, string> = {
        rice: "RICE",
        maize: "MAIZE",
        peanut: "PEANUT",
        sorghum: "SORGHUM",
        cowpea: "COWPEA",
        millet: "MILLET",
        wheat: "WHEAT",
        // Accepter aussi les majuscules
        RICE: "RICE",
        MAIZE: "MAIZE",
        PEANUT: "PEANUT",
        SORGHUM: "SORGHUM",
        COWPEA: "COWPEA",
        MILLET: "MILLET",
        WHEAT: "WHEAT",
      };
      return mapping[val] || val;
    })
    .refine(
      (val) =>
        [
          "RICE",
          "MAIZE",
          "PEANUT",
          "SORGHUM",
          "COWPEA",
          "MILLET",
          "WHEAT",
        ].includes(val),
      { message: "Type de culture invalide" }
    ),
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
