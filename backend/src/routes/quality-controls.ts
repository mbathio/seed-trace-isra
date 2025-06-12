// ===== 4. backend/src/routes/quality-controls.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { qualityControlTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import {
  createQualityControlSchema,
  updateQualityControlSchema,
} from "../validators/qualityControl";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(qualityControlTransformation);

// Routes...
router.get("/", QualityControlController.getQualityControls);
router.get("/:id", QualityControlController.getQualityControlById);
router.post(
  "/",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }),
  QualityControlController.createQualityControl
);
router.put(
  "/:id",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }),
  QualityControlController.updateQualityControl
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

export default router;
