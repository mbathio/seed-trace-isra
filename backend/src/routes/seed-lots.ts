// backend/src/routes/seed-lots.ts - VERSION CORRIGÉE AVEC ORDRE CRITIQUE

import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import { fullTransformation } from "../middleware/transformationMiddleware";
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
router.use(fullTransformation);

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

// ========================================
// ⚠️ SECTION CRITIQUE: ROUTES SPÉCIALES EN PREMIER
// Ces routes DOIVENT être définies AVANT les routes avec :id
// sinon "export", "search", "bulk-update" seront traités comme des IDs
// ========================================

// 1️⃣ EXPORT - AVANT /:id
router.get(
  "/export",
  authMiddleware,
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  parseQueryParams,
  SeedLotController.exportSeedLots
);

// 2️⃣ SEARCH - AVANT /:id
router.get("/search", parseQueryParams, SeedLotController.searchSeedLots);

// 3️⃣ BULK OPERATIONS - AVANT /:id
router.post(
  "/bulk-update",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: bulkUpdateSchema }),
  SeedLotController.bulkUpdateSeedLots
);

// ========================================
// ROUTES PUBLIQUES GÉNÉRALES
// ========================================

// GET /api/seed-lots - Liste des lots avec filtres
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

// POST /api/seed-lots - Créer un nouveau lot (protégé)
router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

// ========================================
// ROUTES AVEC PARAMÈTRE :id
// Ces routes viennent APRÈS les routes spéciales
// ========================================

// GET /api/seed-lots/:id - Détails d'un lot
router.get("/:id", SeedLotController.getSeedLotById);

// PUT /api/seed-lots/:id - Mettre à jour un lot
router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

// DELETE /api/seed-lots/:id - Supprimer un lot
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  SeedLotController.deleteSeedLot
);

// ========================================
// ROUTES SPÉCIFIQUES À UN LOT (:id/action)
// ========================================

// GET /api/seed-lots/:id/genealogy
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);

// GET /api/seed-lots/:id/qr-code
router.get("/:id/qr-code", SeedLotController.getQRCode);

// GET /api/seed-lots/:id/stats
router.get("/:id/stats", SeedLotController.getSeedLotStats);

// GET /api/seed-lots/:id/history
router.get("/:id/history", SeedLotController.getSeedLotHistory);

// POST /api/seed-lots/:id/child-lots
router.post(
  "/:id/child-lots",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createChildLotSchema }),
  SeedLotController.createChildLot
);

// POST /api/seed-lots/:id/transfer
router.post(
  "/:id/transfer",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN", "MANAGER"),
  validateRequest({ body: transferLotSchema }),
  SeedLotController.transferLot
);

// POST /api/seed-lots/:id/validate
router.post(
  "/:id/validate",
  authMiddleware,
  requireRole("INSPECTOR", "ADMIN"),
  SeedLotController.validateSeedLot
);

export default router;
