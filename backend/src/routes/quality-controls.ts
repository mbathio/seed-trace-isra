// backend/src/routes/quality-controls.ts - ✅ RENOMMÉ ET CORRIGÉ
import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import {
  createQualityControlSchema,
  updateQualityControlSchema,
} from "../validators/qualityControl";

const router = Router();

// ✅ GET /api/quality-controls - Liste des contrôles qualité
router.get("/", QualityControlController.getQualityControls);

// ✅ GET /api/quality-controls/:id - Détails d'un contrôle
router.get("/:id", QualityControlController.getQualityControlById);

// ✅ POST /api/quality-controls - Créer un nouveau contrôle
router.post(
  "/",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }),
  QualityControlController.createQualityControl
);

// ✅ PUT /api/quality-controls/:id - Mettre à jour un contrôle
router.put(
  "/:id",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }),
  QualityControlController.updateQualityControl
);

// ✅ DELETE /api/quality-controls/:id - Supprimer un contrôle
router.delete(
  "/:id",
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

export default router;
