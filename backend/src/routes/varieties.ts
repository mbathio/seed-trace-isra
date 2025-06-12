// ===== 2. backend/src/routes/varieties.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { varietyTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(varietyTransformation);

const createVarietySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  cropType: z.enum(["rice", "maize", "peanut", "sorghum", "cowpea", "millet"]), // ✅ VALEURS UI
  description: z.string().optional(),
  maturityDays: z.number().positive(),
  yieldPotential: z.number().positive().optional(),
  resistances: z.array(z.string()).optional(),
  origin: z.string().optional(),
  releaseYear: z.number().optional(),
});

const updateVarietySchema = createVarietySchema.partial().omit({ code: true });

// GET /api/varieties
router.get("/", VarietyController.getVarieties);

// GET /api/varieties/:id
router.get("/:id", VarietyController.getVarietyById);

// POST /api/varieties
router.post(
  "/",
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: createVarietySchema }),
  VarietyController.createVariety
);

// PUT /api/varieties/:id
router.put(
  "/:id",
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: updateVarietySchema }),
  VarietyController.updateVariety
);

// DELETE /api/varieties/:id
router.delete("/:id", requireRole("ADMIN"), VarietyController.deleteVariety);

export default router;
