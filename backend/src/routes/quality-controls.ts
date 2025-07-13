import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import {
  createQualityControlSchema,
  updateQualityControlSchema,
} from "../validators/qualityControl";

const router = Router();

// ✅ Appliquer le middleware de transformation
router.use(fullTransformation);

// Routes
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
