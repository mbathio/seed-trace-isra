// backend/src/routes/quality-controls.ts - VERSION NETTOYÉE

import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import {
  createQualityControlSchema,
  updateQualityControlSchema,
  qualityControlQuerySchema,
} from "../validators/qualityControl";

const router = Router();

// Routes publiques
router.get(
  "/",
  validateRequest({ query: qualityControlQuerySchema }),
  QualityControlController.getQualityControls
);

router.get("/:id", QualityControlController.getQualityControlById);

// Routes protégées
router.post(
  "/",
  authMiddleware,
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }),
  QualityControlController.createQualityControl
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }),
  QualityControlController.updateQualityControl
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

export default router;
