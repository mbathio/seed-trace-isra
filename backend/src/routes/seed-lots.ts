// backend/src/routes/seed-lots.ts

import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import { seedLotTransformation } from "../middleware/transformationMiddleware";
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
  createChildLotSchema,
  transferLotSchema,
  bulkUpdateSchema,
} from "../validators/seedLot";

const router = Router();

// Appliquer le middleware de transformation
router.use(seedLotTransformation);

// Routes publiques (consultation)
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

router.get("/search", SeedLotController.searchSeedLots);

router.get(
  "/export",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  SeedLotController.exportSeedLots
);

router.get("/:id", SeedLotController.getSeedLotById);
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);
router.get("/:id/qr-code", SeedLotController.getQRCode);
router.get("/:id/stats", SeedLotController.getSeedLotStats);
router.get("/:id/history", SeedLotController.getSeedLotHistory);

// Routes protégées (modification)
router.use(authMiddleware); // Toutes les routes suivantes nécessitent une authentification

// CRUD Operations
router.post(
  "/",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

router.put(
  "/:id",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

router.delete("/:id", requireRole("ADMIN"), SeedLotController.deleteSeedLot);

// Bulk operations
router.post(
  "/bulk-update",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: bulkUpdateSchema }),
  SeedLotController.bulkUpdateSeedLots
);

// Child lots and transfers
router.post(
  "/:id/child-lots",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createChildLotSchema }),
  SeedLotController.createChildLot
);

router.post(
  "/:id/transfer",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN", "MANAGER"),
  validateRequest({ body: transferLotSchema }),
  SeedLotController.transferLot
);

// Validation
router.post(
  "/:id/validate",
  requireRole("INSPECTOR", "ADMIN"),
  SeedLotController.validateSeedLot
);

export default router;
