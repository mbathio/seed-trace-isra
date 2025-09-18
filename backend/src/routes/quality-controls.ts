// backend/src/routes/quality-controls.ts - VERSION UNIFIÉE (sans transformation)

import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import {
  createQualityControlSchema,
  updateQualityControlSchema,
  qualityControlQuerySchema,
} from "../validators/qualityControl";

const router = Router();

// ✅ CORRECTION: Plus de middleware de transformation
// router.use(fullTransformation); // ❌ SUPPRIMÉ

// Routes
router.get(
  "/",
  validateRequest({ query: qualityControlQuerySchema }), // ✅ Utilise les enums Prisma directement
  QualityControlController.getQualityControls
);

router.get("/:id", QualityControlController.getQualityControlById);

router.post(
  "/",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }), // ✅ Utilise les enums Prisma directement
  QualityControlController.createQualityControl
);

router.put(
  "/:id",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }), // ✅ Utilise les enums Prisma directement
  QualityControlController.updateQualityControl
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

export default router;
