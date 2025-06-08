// backend/src/routes/varieties.ts
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createVarietySchema = z.object({
  code: z.string().min(1), // ✅ Code obligatoire
  name: z.string().min(1),
  cropType: z.enum(["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"]), // ✅ MAJUSCULES
  description: z.string().optional(),
  maturityDays: z.number().positive(),
  yieldPotential: z.number().positive().optional(),
  resistances: z.array(z.string()).optional(),
  origin: z.string().optional(),
  releaseYear: z.number().optional(),
});

const updateVarietySchema = createVarietySchema.partial().omit({ code: true }); // ✅ Code non modifiable

// GET /api/varieties
router.get("/", VarietyController.getVarieties);

// GET /api/varieties/:id (peut être un ID numérique ou un code)
router.get("/:id", VarietyController.getVarietyById);

// POST /api/varieties
router.post(
  "/",
  requireRole("RESEARCHER", "ADMIN"), // ✅ MAJUSCULES
  validateRequest({ body: createVarietySchema }),
  VarietyController.createVariety
);

// PUT /api/varieties/:id
router.put(
  "/:id",
  requireRole("RESEARCHER", "ADMIN"), // ✅ MAJUSCULES
  validateRequest({ body: updateVarietySchema }),
  VarietyController.updateVariety
);

// DELETE /api/varieties/:id
router.delete(
  "/:id",
  requireRole("ADMIN"), // ✅ MAJUSCULES
  VarietyController.deleteVariety
);

export default router;
