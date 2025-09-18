// backend/src/routes/multipliers.ts - VERSION UNIFIÉE FINALE
import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import {
  createMultiplierSchema,
  updateMultiplierSchema,
  multiplierQuerySchema,
} from "../validators/multipliers";

const router = Router();

// Routes publiques
router.get(
  "/",
  validateRequest({ query: multiplierQuerySchema }),
  MultiplierController.getMultipliers
);

router.get("/:id", MultiplierController.getMultiplierById);
router.get("/:id/contracts", MultiplierController.getContracts);

// Routes protégées
router.post(
  "/",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createMultiplierSchema }),
  MultiplierController.createMultiplier
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateMultiplierSchema }),
  MultiplierController.updateMultiplier
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  MultiplierController.deleteMultiplier
);

router.post(
  "/:id/contracts",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  MultiplierController.createContract
);

export default router;
