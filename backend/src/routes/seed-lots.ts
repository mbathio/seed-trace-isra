// backend/src/routes/seed-lots.ts - VERSION UNIFIÉE FINALE
import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
  createChildLotSchema,
  transferLotSchema,
  bulkUpdateSchema,
} from "../validators/seedLot";

const router = Router();

// ✅ PLUS DE MIDDLEWARE DE TRANSFORMATION

// Routes publiques (consultation)
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }), // ✅ Validation directe
  SeedLotController.getSeedLots
);

router.get("/search", parseQueryParams, SeedLotController.searchSeedLots);
router.get("/:id", SeedLotController.getSeedLotById);
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);
router.get("/:id/qr-code", SeedLotController.getQRCode);
router.get("/:id/stats", SeedLotController.getSeedLotStats);
router.get("/:id/history", SeedLotController.getSeedLotHistory);

// Routes protégées
router.get(
  "/export",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  SeedLotController.exportSeedLots
);

router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }), // ✅ Validation directe
  SeedLotController.createSeedLot
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }), // ✅ Validation directe
  SeedLotController.updateSeedLot
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  SeedLotController.deleteSeedLot
);

// Bulk operations
router.post(
  "/bulk-update",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: bulkUpdateSchema }),
  SeedLotController.bulkUpdateSeedLots
);

// Child lots and transfers
router.post(
  "/:id/child-lots",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createChildLotSchema }),
  SeedLotController.createChildLot
);

router.post(
  "/:id/transfer",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN", "MANAGER"),
  validateRequest({ body: transferLotSchema }),
  SeedLotController.transferLot
);

// Validation
router.post(
  "/:id/validate",
  authMiddleware,
  requireRole("INSPECTOR", "ADMIN"),
  SeedLotController.validateSeedLot
);

export default router;
