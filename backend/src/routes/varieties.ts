// backend/src/routes/varieties.ts - VERSION UNIFIÉE FINALE
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest, validateNumericId } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import {
  createVarietySchema,
  updateVarietySchema,
  varietyQuerySchema,
} from "../validators/varieties";

const router = Router();

// Routes publiques
router.get(
  "/",
  validateRequest({ query: varietyQuerySchema }), // ✅ Validation directe
  VarietyController.getVarieties
);

router.get("/:id", VarietyController.getVarietyById);

// Routes protégées
router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: createVarietySchema }), // ✅ Validation directe
  VarietyController.createVariety
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: updateVarietySchema }), // ✅ Validation directe
  VarietyController.updateVariety
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  VarietyController.deleteVariety
);

export default router;
