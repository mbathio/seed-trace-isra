// backend/src/routes/seed-lots.ts - VERSION CORRIGÉE AVEC LOGS

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

// Middleware de debug pour les requêtes
if (process.env.NODE_ENV === "development") {
  router.use((req, res, next) => {
    console.log(`[SeedLots] ${req.method} ${req.path}`, {
      query: req.query,
      body: req.body,
      params: req.params,
    });
    next();
  });
}

// Routes publiques (consultation) - PAS D'AUTHENTIFICATION REQUISE
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

router.get("/search", parseQueryParams, SeedLotController.searchSeedLots);

router.get("/:id", SeedLotController.getSeedLotById);
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);
router.get("/:id/qr-code", SeedLotController.getQRCode);
router.get("/:id/stats", SeedLotController.getSeedLotStats);
router.get("/:id/history", SeedLotController.getSeedLotHistory);

// Routes protégées - AUTHENTIFICATION REQUISE
router.get(
  "/export",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  SeedLotController.exportSeedLots
);

// CRUD Operations (protégées)
router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
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
